/*  src/pages/VideoManual.tsx  – cloud data + scoped, non‑blocking search
 *  -----------------------------------------------------------------
 *  Lambda endpoint:
 *     GET https://c5pnv814u2.execute-api.us-west-1.amazonaws.com/trainingVideos
 *  returns:
 *     { videos:[ { id,label,src,captionsUrl,topicsUrl }, ... ] }
 *
 *  All original features preserved (timeline, caption pane, UX tweaks).
 *  New features:
 *    • Scope selector (Topics / Captions / Both)
 *    • React 18 non‑blocking search (`useDeferredValue` + `useMemo`)
 *    • Caption results capped to 200 for snappy rendering
 *  -----------------------------------------------------------------
 */

import {
  useEffect,
  useRef,
  useState,
  useDeferredValue,
  useMemo,
} from 'react';

const API = 'https://c5pnv814u2.execute-api.us-west-1.amazonaws.com';

/* ──────────────── Types ──────────────── */
interface RemoteVideo {
  id: string;
  label: string;
  src: string;
  captionsUrl: string;
  topicsUrl: string;
}
interface Cue      { start: number; end: number; text: string }
interface TopicDef { label: string; time: number }

interface GlobalTopic   extends TopicDef {
  videoId: string;
  videoLabel: string;
}
interface GlobalCaption {
  text: string;
  time: number;
  videoId: string;
  videoLabel: string;
}

/* ─────────── Component ─────────── */
const VideoManual = () => {
  /* refs */
  const videoRef    = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const captionRef  = useRef<HTMLDivElement>(null);

  /* state */
  const [videos,        setVideos]        = useState<RemoteVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<RemoteVideo | null>(null);

  const [vttUrl,        setVttUrl]        = useState('');
  const [captionCues,   setCaptionCues]   = useState<Cue[]>([]);
  const [topics,        setTopics]        = useState<TopicDef[]>([]);
  const [manualMap,     setManualMap]     = useState<Record<string, string[]>>({});

  const [allTopics,     setAllTopics]     = useState<GlobalTopic[]>([]);
  const [allCaptions,   setAllCaptions]   = useState<GlobalCaption[]>([]);

  const [search,        setSearch]        = useState('');
  const [scope,         setScope]         = useState<'topics' | 'captions' | 'both'>('topics');

  const [err,           setErr]           = useState<string | null>(null);
  const [loading,       setLoading]       = useState(true);

  /* ───── Inject CSS once ───── */
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = /* css */ `
      :root{
        font-family:Inter,system-ui,Avenir,Helvetica,Arial,sans-serif;
        line-height:1.5;
      }
      html,body{height:100%;margin:0;}
      body{display:flex;flex-direction:column;background:#f5f5f5;}
      button{
        padding:.55em 1.1em;
        font-size:.9em;
        background:none;
        border:none;
        cursor:pointer;
      }
      button:hover{outline:3px auto -webkit-focus-ring-color;}
      *{box-sizing:border-box;}

      .container{
        display:grid;
        grid-template-columns:3fr 1fr;
        height:100vh;
      }
      .video-col{
        padding:20px;
        background:#fff;
        display:flex;
        flex-direction:column;
        overflow-y:auto;
      }
      .topics-col{
        padding:20px;
        background:#fafbfc;
        border-left:1px solid #e1e3e8;
        overflow-y:auto;
      }

      .controls-row{
        display:flex;
        align-items:center;
        gap:12px;
        margin-bottom:12px;
      }
      .file-label{
        display:inline-block;
        padding:8px 12px;
        background:#2f80ed;
        color:#fff;
        border-radius:4px;
      }
      select{
        padding:6px 10px;
        border:1px solid #e1e3e8;
        border-radius:4px;
      }

      .search-row{
        display:flex;
        gap:8px;
        margin-bottom:16px;
      }
      .topic-search{
        flex:1;
        padding:6px 10px;
        border:1px solid #e1e3e8;
        border-radius:4px;
      }
      .scope-select{
        padding:6px 10px;
        border:1px solid #e1e3e8;
        border-radius:4px;
      }

      video{
        width:100%;
        max-height:60vh;
        border-radius:4px;
        box-shadow:0 2px 8px rgba(0,0,0,.1);
      }
      video::cue{background:rgba(0,0,0,.8);color:#fff;}

      .timeline-container{
        position:relative;
        height:8px;
        background:#dde2eb;
        margin:12px 0;
        border-radius:4px;
      }
      .timeline-marker{
        position:absolute;
        top:-2px;
        width:4px;
        height:12px;
        background:#eb5757;
        border-radius:2px;
        cursor:pointer;
      }
      .topic-marker{
        position:absolute;
        top:-3px;
        width:6px;
        height:14px;
        background:#2f80ed;
        border-radius:3px;
        cursor:pointer;
      }
      .playhead{
        position:absolute;
        top:-4px;
        width:2px;
        height:16px;
        background:#333;
      }

      .caption-preview{
        max-height:200px;
        overflow-y:auto;
        background:rgba(0,0,0,.8);
        color:#fff;
        padding:12px;
        border-radius:4px;
        font-size:.85em;
        line-height:1.3;
        position:sticky;
        bottom:0;
        margin-top:12px;
      }
      .caption-line.active{color:#2f80ed;}

      h3{margin:0 0 16px;font-size:1.05em;color:#213547;}
      details{margin-bottom:16px;}
      summary{
        display:flex;
        align-items:center;
        gap:8px;
        padding:8px 12px;
        background:#fff;
        border:1px solid #e1e3e8;
        border-radius:4px;
        font-weight:600;
        cursor:pointer;
      }
      summary:hover{background:#f9f9f9;border-color:#2f80ed;}
      summary::after{
        margin-left:auto;
        content:'▶';
        color:#2f80ed;
        transition:transform .2s;
      }
      details[open] summary::after{transform:rotate(90deg);}

      .topic-button{
        display:block;
        width:calc(100% - 32px);
        margin:8px 16px 0;
        padding:6px 10px;
        background:#fff;
        border:1px solid #e1e3e8;
        border-radius:4px;
        cursor:pointer;
      }
      .topic-button:hover{background:#e6f0ff;}

      .manual-text{
        margin:12px 16px;
        padding:12px 16px;
        background:#fff;
        border-left:4px solid #2f80ed;
        border-radius:4px;
        font-size:.85em;
        line-height:1.45;
        box-shadow:0 1px 4px rgba(0,0,0,.05);
        max-height:300px;
        overflow-y:auto;
      }

      .download-btn{
        padding:6px 10px;
        background:#2f80ed;
        color:#fff;
        border-radius:4px;
        text-decoration:none;
      }
      .download-btn:hover{background:#1c6ddf;}

      .micro-watch{
        margin-left:auto;
        background:none;
        border:none;
        color:#2f80ed;
        cursor:pointer;
        font-size:.9em;
      }
      .micro-watch:hover{color:#1c6ddf;}

      .error-banner{
        margin:12px 0;
        padding:10px 14px;
        border-left:4px solid #eb5757;
        background:#ffeef0;
        color:#86181d;
        border-radius:4px;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  /* ───── Fetch list (once) ───── */
  useEffect(() => {
    fetch(`${API}/trainingVideos`)
      .then(r => r.json())
      .then((d: { videos: RemoteVideo[] }) => {
        setVideos(d.videos);
        setSelectedVideo(d.videos[0] ?? null);

        /* preload topics & captions for global search */
        Promise.all(
          d.videos.map(v =>
            Promise.all([
              fetch(v.topicsUrl).then(r => r.text()),
              fetch(v.captionsUrl).then(r => r.text()),
            ]).then(([tTxt, cTxt]) => {
              const topicArr = parseSRT(tTxt)
                .map<TopicDef>(c => {
                  const label = c.text.split('\n')[0].replace(/^Topic:\s*/i, '').trim();
                  return { label, time: c.start };
                })
                .map(t => ({ ...t, videoId: v.id, videoLabel: v.label }));
              const capArr = parseSRT(cTxt).map<GlobalCaption>(c => ({
                text: c.text.replace(/\n/g, ' '),
                time: c.start,
                videoId: v.id,
                videoLabel: v.label,
              }));
              return { topicArr, capArr };
            }),
          ),
        ).then(res => {
          setAllTopics(res.flatMap(r => r.topicArr));
          setAllCaptions(res.flatMap(r => r.capArr));
        });
      })
      .catch(e => setErr(e.toString()))
      .finally(() => setLoading(false));
  }, []);

  /* ───── Load captions & topics when video changes ───── */
  useEffect(() => {
    if (!selectedVideo) return;
    let vttObjUrl: string | undefined;
    setCaptionCues([]); setTopics([]); setManualMap({}); setErr(null);

    const pCaptions = fetch(selectedVideo.captionsUrl)
      .then(r => r.text())
      .then(txt => {
        setCaptionCues(parseSRT(txt));
        vttObjUrl = URL.createObjectURL(
          new Blob(
            [
              'WEBVTT\n\n',
              txt
                .replace(/\r\n/g, '\n')
                .replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4'),
            ],
            { type: 'text/vtt' },
          ),
        );
        setVttUrl(vttObjUrl);
      });

    const pTopics = fetch(selectedVideo.topicsUrl)
      .then(r => r.text())
      .then(txt => {
        const tArr: TopicDef[] = [];
        const mMap: Record<string, string[]> = {};
        parseSRT(txt).forEach(c => {
          const lines = c.text.split('\n').map(l => l.trim()).filter(Boolean);
          if (!lines.length) return;
          const label = lines[0].replace(/^Topic:\s*/i, '').trim();
          tArr.push({ label, time: c.start });
          mMap[label] = lines.slice(1);
        });
        setTopics(tArr);
        setManualMap(mMap);
      });

    Promise.allSettled([pCaptions, pTopics])
      .then(() => {
        const draw = () => videoRef.current && drawMarkers(captionCues, topics);
        videoRef.current?.readyState! >= 1
          ? draw()
          : videoRef.current?.addEventListener('loadedmetadata', draw, { once: true });
      })
      .catch(e => setErr(e.toString()));

    return () => { if (vttObjUrl) URL.revokeObjectURL(vttObjUrl); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVideo]);

  /* ───── Keep caption pane in sync (no auto‑scroll) ───── */
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onTime = () => updateCaptions(vid.currentTime);
    vid.addEventListener('timeupdate', onTime);
    return () => vid.removeEventListener('timeupdate', onTime);
  }, [captionCues]);

  /* ─────────── Helpers ─────────── */
  const toSec = (t: string) => {
    const [h, m, s] = t.replace(',', '.').split(':');
    return +h * 3600 + +m * 60 + +s;
  };

  const parseSRT = (raw: string): Cue[] => {
    const lines = raw.replace(/\r/g, '').split('\n');
    const out: Cue[] = [];
    let i = 0;
    while (i < lines.length) {
      if (!lines[i].trim()) { i++; continue; }
      /^\d+$/.test(lines[i].trim()) ? i++ : i++;
      if (i >= lines.length) break;
      const mt = lines[i].match(/([\d:,]+)\s*-->\s*([\d:,]+)/);
      if (!mt) { i++; continue; }
      const [start, end] = [toSec(mt[1]), toSec(mt[2])];
      i++;
      const txt: string[] = [];
      while (i < lines.length && lines[i].trim()) txt.push(lines[i++]);
      out.push({ start, end, text: txt.join('\n') });
    }
    return out;
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const drawMarkers = (caps: Cue[], tops: TopicDef[]) => {
    const tl = timelineRef.current!;
    const vid = videoRef.current!;
    tl.innerHTML = '';

    caps.forEach(c => {
      const el = document.createElement('div');
      el.className = 'timeline-marker';
      el.style.left = `${(c.start / vid.duration) * 100}%`;
      el.title = c.text.replace(/\n/g, ' ');
      el.onclick = () => { vid.currentTime = c.start; vid.play(); };
      tl.appendChild(el);
    });

    tops.forEach(t => {
      const el = document.createElement('div');
      el.className = 'topic-marker';
      el.style.left = `${(t.time / vid.duration) * 100}%`;
      el.title = t.label;
      el.onclick = () => { vid.currentTime = t.time; vid.play(); };
      tl.appendChild(el);
    });

    const ph = document.createElement('div');
    ph.className = 'playhead';
    tl.appendChild(ph);
    vid.ontimeupdate = () => { ph.style.left = `${(vid.currentTime / vid.duration) * 100}%`; };
  };

  const updateCaptions = (t: number) => {
    if (!captionRef.current) return;
    captionRef.current.innerHTML = captionCues
      .map(
        c =>
          `<div class="caption-line${t >= c.start && t <= c.end ? ' active' : ''}">
             ${fmt(c.start)} — ${c.text.replace(/\n/g, ' ')}
           </div>`,
      )
      .join('');
  };

  /* ─────────── Non‑blocking, memoized search ─────────── */
  const deferredTerm = useDeferredValue(search.trim().toLowerCase());

  const { topicHits, captionHits } = useMemo(() => {
    if (!deferredTerm) return { topicHits: [] as GlobalTopic[], captionHits: [] as GlobalCaption[] };

    const topicHitsLocal =
      (scope === 'topics' || scope === 'both')
        ? allTopics.filter(t => t.label.toLowerCase().includes(deferredTerm))
        : [];

    const captionHitsLocal =
      (scope === 'captions' || scope === 'both')
        ? allCaptions
            .filter(c => c.text.toLowerCase().includes(deferredTerm))
            .slice(0, 200)               // hard cap
        : [];

    return { topicHits: topicHitsLocal, captionHits: captionHitsLocal };
  }, [deferredTerm, scope, allTopics, allCaptions]);

  /* ─────────── Render ─────────── */
  if (loading)               return <p style={{ padding: 20 }}>Loading training videos…</p>;
  if (err)                   return <p style={{ padding: 20, color: '#86181d' }}>{err}</p>;
  if (!videos.length)        return <p style={{ padding: 20 }}>No clips found.</p>;

  const termActive = !!deferredTerm;

  return (
    <div className="container">
      {/* ───────── Left column (video) ───────── */}
      <div className="video-col">
        <div className="controls-row">
          <label className="file-label" htmlFor="vidSel">Select Video</label>
          <select
            id="vidSel"
            value={selectedVideo?.id || ''}
            onChange={e => setSelectedVideo(videos.find(v => v.id === e.target.value)!)}
          >
            {videos.map(v => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>

          {selectedVideo && (
            <a
              className="download-btn"
              href={selectedVideo.captionsUrl}
              download={`${selectedVideo.label}-captions.srt`}
            >
              ⬇ SRT
            </a>
          )}
        </div>

        {selectedVideo && (
          <video key={selectedVideo.id} ref={videoRef} controls>
            <source src={selectedVideo.src} type="video/mp4" />
            {vttUrl && (
              <track kind="captions" srcLang="en" label="English" src={vttUrl} default />
            )}
          </video>
        )}

        {err && <div className="error-banner">{err}</div>}
        <div className="timeline-container" ref={timelineRef} />
        <div className="caption-preview" ref={captionRef} />
      </div>

      {/* ───────── Right column (topics / search) ───────── */}
      <div className="topics-col">
        {/* search controls */}
        <div className="search-row">
          <input
            className="topic-search"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="scope-select"
            value={scope}
            onChange={e => setScope(e.target.value as any)}
          >
            <option value="topics">Topics</option>
            <option value="captions">Captions</option>
            <option value="both">Both</option>
          </select>
        </div>

        {/* search results OR topic navigation */}
        {termActive ? (
          <>
            <h3>Search Results</h3>

            {topicHits.map(r => (
              <details key={`t-${r.videoId}-${r.time}-${r.label}`}>
                <summary
                  onClick={() => {
                    setSelectedVideo(videos.find(v => v.id === r.videoId)!);
                    setTimeout(() => {
                      videoRef.current!.currentTime = r.time;
                      videoRef.current!.play();
                    }, 0);
                  }}
                >
                  {r.label}
                  <span style={{ marginLeft: 'auto', fontWeight: 400 }}>{r.videoLabel}</span>
                </summary>
              </details>
            ))}

            {captionHits.map(r => (
              <details key={`c-${r.videoId}-${r.time}-${r.text.slice(0,30)}`}>
                <summary
                  onClick={() => {
                    setSelectedVideo(videos.find(v => v.id === r.videoId)!);
                    setTimeout(() => {
                      videoRef.current!.currentTime = r.time;
                      videoRef.current!.play();
                    }, 0);
                  }}
                >
                  <em>{r.text.length > 60 ? r.text.slice(0,60)+'…' : r.text}</em>
                  <span style={{ marginLeft: 'auto', fontWeight: 400 }}>{r.videoLabel}</span>
                </summary>
              </details>
            ))}

            {!topicHits.length && !captionHits.length && <p>No matches.</p>}
          </>
        ) : (
          <>
            <h3>Topic Navigation</h3>
            {topics.map(t => (
              <details key={t.label}>
                <summary>
                  {t.label}
                  <button
                    className="micro-watch"
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      videoRef.current!.currentTime = t.time;
                      videoRef.current!.play();
                    }}
                  >
                    ► Watch
                  </button>
                </summary>

                <button
                  className="topic-button"
                  type="button"
                  onClick={() => {
                    videoRef.current!.currentTime = t.time;
                    videoRef.current!.play();
                  }}
                >
                  Show Manual
                </button>

                <div className="manual-text">
                  {(manualMap[t.label] || []).map((ln, i) => (
                    <p key={i}>{ln}</p>
                  ))}
                </div>
              </details>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default VideoManual;
