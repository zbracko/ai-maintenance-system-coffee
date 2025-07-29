/*  src/pages/VideoManual.tsx  – cloud data + scoped, non‑blocking search
 *  -----------------------------------------------------------------
 *  Lambda endpoint:
 *     GET https://no2z4z1mrl.execute-api.us-west-1.amazonaws.com/trainingVideos
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

const API = 'https://no2z4z1mrl.execute-api.us-west-1.amazonaws.com';

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
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        line-height: 1.6;
      }
      html,body{height:100%;margin:0;}
      body{
        display:flex;
        flex-direction:column;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        min-height: 100vh;
      }
      button{
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(20px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      }
      button:hover{
        background: rgba(255, 255, 255, 1);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }
      *{box-sizing:border-box;}

      .container{
        display:grid;
        grid-template-columns:3fr 1fr;
        height:100vh;
        gap: 20px;
        padding: 20px;
      }
      .video-col{
        padding: 24px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        display:flex;
        flex-direction:column;
        overflow-y:auto;
      }
      .topics-col{
        padding: 24px;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(20px);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        overflow-y:auto;
      }

      .controls-row{
        display:flex;
        align-items:center;
        gap:12px;
        margin-bottom:20px;
      }
      .file-label{
        display:inline-block;
        padding: 10px 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        border-radius: 12px;
        font-weight: 600;
        font-size: 14px;
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        transition: all 0.3s ease;
      }
      .file-label:hover{
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
      }
      select{
        padding: 10px 14px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      }

      .search-row{
        display:flex;
        gap:12px;
        margin-bottom:20px;
      }
      .topic-search{
        flex:1;
        padding: 12px 16px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        font-size: 14px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }
      .topic-search:focus{
        outline: none;
        border-color: rgba(102, 126, 234, 0.5);
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2);
      }
      .scope-select{
        padding: 12px 16px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      }

      video{
        width:100%;
        max-height:60vh;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
      video::cue{
        background: rgba(30, 41, 59, 0.9);
        color: #fff;
        border-radius: 8px;
        padding: 4px 8px;
      }

      .timeline-container{
        position:relative;
        height: 12px;
        background: rgba(226, 232, 240, 0.8);
        margin: 16px 0;
        border-radius: 8px;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .timeline-marker{
        position:absolute;
        top:-2px;
        width: 6px;
        height: 16px;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        border-radius: 4px;
        cursor:pointer;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        transition: all 0.2s ease;
      }
      .timeline-marker:hover{
        transform: scale(1.2);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
      }
      .topic-marker{
        position:absolute;
        top:-3px;
        width: 8px;
        height: 18px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 6px;
        cursor:pointer;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        transition: all 0.2s ease;
      }
      .topic-marker:hover{
        transform: scale(1.2);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
      }
      .playhead{
        position:absolute;
        top:-6px;
        width: 4px;
        height: 24px;
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(30, 41, 59, 0.3);
      }

      .caption-preview{
        max-height: 200px;
        overflow-y: auto;
        background: rgba(30, 41, 59, 0.95);
        backdrop-filter: blur(20px);
        color: #f8fafc;
        padding: 16px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.5;
        position: sticky;
        bottom: 0;
        margin-top: 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .caption-line.active{
        color: #a7f3d0;
        font-weight: 600;
        background: rgba(167, 243, 208, 0.1);
        padding: 4px 8px;
        border-radius: 6px;
        margin: 2px 0;
      }

      h3{
        margin: 0 0 20px;
        font-size: 18px;
        font-weight: 700;
        color: rgba(30, 41, 59, 0.9);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      details{
        margin-bottom: 16px;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      summary{
        display:flex;
        align-items:center;
        gap:12px;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        font-weight: 600;
        color: rgba(30, 41, 59, 0.9);
        cursor: pointer;
        transition: all 0.3s ease;
      }
      summary:hover{
        background: rgba(255, 255, 255, 1);
        border-color: rgba(102, 126, 234, 0.3);
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
      summary::after{
        margin-left:auto;
        content:'▶';
        color: #667eea;
        transition: transform 0.3s ease;
        font-size: 12px;
      }
      details[open] summary::after{transform:rotate(90deg);}

      .topic-button{
        display:block;
        width: calc(100% - 32px);
        margin: 12px 16px 0;
        padding: 10px 14px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 10px;
        cursor: pointer;
        font-weight: 500;
        color: rgba(30, 41, 59, 0.8);
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .topic-button:hover{
        background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        color: rgba(30, 41, 59, 1);
      }

      .manual-text{
        margin: 12px 16px;
        padding: 16px 20px;
        background: rgba(248, 250, 252, 0.95);
        backdrop-filter: blur(20px);
        border-left: 4px solid #667eea;
        border-radius: 10px;
        font-size: 14px;
        line-height: 1.6;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        max-height: 300px;
        overflow-y: auto;
        color: rgba(30, 41, 59, 0.8);
      }

      .download-btn{
        padding: 10px 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        border-radius: 12px;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        transition: all 0.3s ease;
        border: none;
      }
      .download-btn:hover{
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
      }

      .micro-watch{
        margin-left: auto;
        background: none;
        border: none;
        color: #667eea;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 8px;
        transition: all 0.3s ease;
      }
      .micro-watch:hover{
        color: #5a67d8;
        background: rgba(102, 126, 234, 0.1);
        transform: scale(1.05);
      }

      .error-banner{
        margin: 16px 0;
        padding: 14px 18px;
        border-left: 4px solid #ef4444;
        background: rgba(254, 242, 242, 0.95);
        backdrop-filter: blur(20px);
        color: #991b1b;
        border-radius: 12px;
        font-weight: 500;
        box-shadow: 0 4px 16px rgba(239, 68, 68, 0.1);
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