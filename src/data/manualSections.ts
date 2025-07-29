// src/data/manualSections.ts

// Import any images or assets used in the manual content
import Picture2 from '../assets/Picture2.png';
import Picture3 from '../assets/Picture3.png';
import Picture4 from '../assets/Picture4.png';
import Picture5 from '../assets/Picture5.png';

// ---------------------
// Interfaces for Manual Sections
// ---------------------
export interface ManualSection {
  id: string;
  title: string;
  content: string[];
  images?: string[];
}

// ---------------------
// Manual Sections Data
// ---------------------
export const manualSections: ManualSection[] = [
  // Legacy full manual for backward compatibility
  {
    id: 'fullManual',
    title: 'Full Manual',
    content: [
      `Manual

-	The padding
-	The feed belts.
-	V-Belts
-	Tapes
-	Chains
-	Pump seals.
-	Oil change.
-	Transport damage.
-	Components damaged by poor maintenance.
-	Spare parts who are placed by a technician who is not trained or schooled by LACO.

PART 3:	MAINTENANCE INSTRUCTIONS.	4
3.1	Maintenance instructions.	4
3.2	Other maintenance points	4
3.3	The possible risks of poor maintenance are.	5
3.4	Oil types.	6
3.5	Troubleshooting guide.	7
3.5.1.	The machine does not reach temperature after pressing the start button	7
3.5.2	Machine is at temperature but ironing bed does not close.	7
3.5.3	The ironing bed closes but the roll does not turn	8
3.5.4	Roll suction does not work.	8
3.5.5	No control voltage.	8
3.5.6 Creases in the linen.	9
3.6. Position of contacts	10
3.7	Position photocells feeding belts.	11
3.8	Position of tape surveillance.	12
3.9	Hydraulic pressure regulation	14
3.10	Speed adjustment between rolls.	16
3.11	Chain	22
3.12	Replace and adjust tension of feed belts.	23
3.13	How to replace V-Belts.	24
3.14	Oil change in reduction gearbox	28
3.15	Placing tapes onto the rolls.	29
3.16	Cleaning of the chest.	34
3.17	Roll padding replacement	36


PART 3:	 MAINTENANCE INSTRUCTIONS.
3.1	Maintenance instructions.
Check the operation of the safety equipment every day!
3.2	Other maintenance points.

On a daily basis
-	Feed a piece of waxed fabric (cleaning cloth) through the ironing machine some 2 to 4 times a day. (4 times when the linen doesn’t enters smoothly the chest, or when there are creases in the linen.) (1 x wax → ± 5min.)

-	Clean the machine with a vacuum cleaner or with air pressure. (1 person → ± 10min.)
-	Clean the filter for the air supply from the frequency inverter. (filter is situated next to the main switch) (1 person → ± 3min.)

12 x per year:
-	Check the overlap from the padding.

4 x per year:
-	Clean the turbines on all the motors including those for the exhaust, circulation pump, roll drive motor and the hydraulic pump. (1 person → ± 30min.)

2 x per year:
-	Check the tension of the chain and feed belts.

Every year:
-	Replace the gear oil. (1 person → ± 30min./roll)
-	Lubricate the chain.  (1 person → ± 5min./roll)
-	Lubricate the roll drive bearing at the suction side. (1 person → ± 10min./roll)

Every 2 years:
-	Change thermal oil every 2 years or every 3500 hours. (1 person → ± 6 hours)

Every 5 years:
-	Change hydraulic oil every 5 years. (1 person → ± 30 min.)

Others:
-	Cleaning the chest and changing the roll padding. (1 person → ± 5 hours) (2 persons → ± 4 hours)
-	If scale occurs on the beds (deposits of water salts at the entrance to the bed), it should be cleaned with the special cleaning cloth that can be bought from LACO.
-	Maintenance should be performed in accordance with the enclosed maintenance plan.
-	It should be performed when the machine is stopped and cold.
-	The manufacturer accepts no liability for defects or accidents due to failure to perform maintenance or poor maintenance or due to the use of spare parts that he has not supplied.`
    ]
  },

  // Detailed PART 3 Chapters
  {
    id: '3.1',
    title: '3.1 Maintenance Instructions',
    content: [
      `Check the operation of the safety equipment every day!`
    ]
  },
  {
    id: '3.2',
    title: '3.2 Other Maintenance Points',
    content: [
      `On a daily basis:
- Feed a piece of waxed fabric (cleaning cloth) through the ironing machine 2 to 4 times a day 
  (4 times when the linen does not feed smoothly or when creases occur) (approx. 5 min per pass).
- Clean the machine with a vacuum cleaner or compressed air (approx. 10 min, 1 person).
- Clean the filter for the air supply from the frequency inverter (located next to the main switch, approx. 3 min, 1 person).

12× per year:
- Check the overlap from the padding.

4× per year:
- Clean the turbines on all motors (exhaust, circulation pump, roll drive motor, and hydraulic pump) (approx. 30 min, 1 person).

2× per year:
- Check the tension of the chain and feed belts.

Every year:
- Replace the gear oil (approx. 30 min per roll, 1 person).
- Lubricate the chain (approx. 5 min per roll, 1 person).
- Lubricate the roll drive bearing at the suction side (approx. 10 min per roll, 1 person).

Every 2 years:
- Change the thermal oil (or every 3500 hours; approx. 6 hours, 1 person).

Every 5 years:
- Change the hydraulic oil (approx. 30 min, 1 person).

Others:
- Clean the chest and change the roll padding (approx. 5 hours for 1 person or 4 hours for 2 persons).
- If scale (water salt deposits) occurs on the beds, use the special cleaning cloth available from LACO.
- Perform maintenance only when the machine is stopped and cold.
- The manufacturer accepts no liability for defects or accidents due to failure to perform maintenance or using incorrect spare parts.`
    ]
  },
  {
    id: '3.3',
    title: '3.3 Possible Risks of Poor Maintenance',
    content: [
      `• Rapid wear of sprockets or bearings due to insufficient lubrication.
• Bearings may overheat (risk of fire) if not properly lubricated.
• Failure to check safety equipment daily may lead to serious accidents.
• Delaying padding replacement can cause irreparable damage to the chest.
• Dust accumulation may lead to fire or explosions.
• Worn or missing feed bands can trap fingers or the linen.
• Overlap in the padding can result in wet spots on the ironed linen.
• Failing to perform regular thermal oil changes may block the chest, leading to very expensive repairs!`
    ]
  },
  {
    id: '3.4',
    title: '3.4 Oil Types',
    content: [
      `ATTENTION:
Each mechanical drive requires a specific type of oil. Always use the standard oil type unless unavailable—mixing oil types can cause blockages and defects.

Roll Drive Gearbox:
- Standard oil: GOYA 220
- Change interval: First change after 6 months, then annually
- Volume: 2.8 liters per gearbox

Alternative oils:
• Q8 Goya 220
• BP Energol GR XP 220
• CASTROL Alpha Sp 220
• ESSO Spartan Ep 220
• FINA Giran 220
• MOBIL Mobilgear 630
• SHELL Omala EP 220

Hydraulic Pump:
- Standard oil: HYDRO 46
- Change interval: Every 2 years
- Volume: 5 liters

Alternative oils:
• Q8 Hayden 46
• BP Energol HLP 46
• CASTROL Hyspin AW5 46
• ESSO Nufo H 46
• FINA Hydran 46
• MOBIL DTE Medicure
• SHELL Turbo T oil 46`
    ]
  },
  {
    id: '3.5',
    title: '3.5 Troubleshooting Guide',
    content: [
      `3.5.1 The machine does not reach temperature after pressing the start button.
Possible cause:
  A. Steam pressure is too low.
Solution:
  A. Increase the steam pressure.

3.5.2 Machine is at temperature but the ironing bed does not close.
Possible causes:
  A. Hydraulic pump M21 is defective.
  B. Contactor K21 is defective.
  C. Thermal overload has tripped.
Solutions:
  A. Replace hydraulic pump M21.
  B. Check contactor K21.
  C. Reset the thermal overload (Q21).

3.5.3 The ironing bed closes but the roll does not turn.
Possible causes:
  A. Foot pedal or finger guard is engaged.
  B. Frequency control is defective.
  C. Thermal overload has tripped.
  D. Motor is defective.
Solutions:
  A. Check or replace contact FDC4 (or FDC2).
  B. Replace the frequency control.
  C. Reset the thermal overload (F4).
  D. Replace motor M11.

3.5.4 Roll suction does not work.
Possible causes:
  A. Motor is defective.
  B. Contactor is defective.
Solutions:
  A. Replace motor M31/M32.
  B. Replace contactor K31/K32.

3.5.5 No control voltage.
Possible causes:
  A. Motor safety failure.
  B. Main switch is defective.
  C. Thermal overload has tripped.
Solutions:
  A. Reset the motor safety.
  B. Replace main switch Q1.
  C. Reset the thermal overload.

3.5.6 Creases in the linen.
Possible causes:
  A. Ironing bed temperature is too low (below 150°C).
  B. Ironing bed is very dirty.
  C. Linen is not rinsed sufficiently.
Solutions:
  A. Increase operating temperature (normally 170°C).
  B. Clean and wax the ironing bed.
  C. Verify rinsing quality.`
    ],
    images: [Picture2, Picture3]
  },
  {
    id: '3.6',
    title: '3.6 Position of Contacts',
    content: [
      `Ensure all electrical contacts are correctly positioned as specified in the wiring diagrams.`
    ]
  },
  {
    id: '3.7',
    title: '3.7 Position Photocells Feeding Belts',
    content: [
      `Verify that the photocells monitoring the feed belts are properly aligned to ensure smooth operation.`
    ]
  },
  {
    id: '3.8',
    title: '3.8 Position of Tape Surveillance',
    content: [
      `When a tape snaps into two pieces, the swing arm will fall downward and cross the laser line.
In such an event, the machine will stop and a message will appear on the touch screen.`
    ]
  },
  {
    id: '3.9',
    title: '3.9 Hydraulic Pressure Regulation',
    content: [
      `Adjust and regulate the hydraulic pressure according to the manufacturer's specifications.
Refer to the technical drawings for the recommended settings.`
    ]
  },
  {
    id: '3.10',
    title: '3.10 Speed Adjustment Between Rolls',
    content: [
      `The ironing rolls must run at different speeds:
- The 2nd roll should run approximately 15 mm faster than the 1st roll.
- The 3rd roll should run approximately 15 mm faster than the 2nd roll.
If the speeds are incorrect, adjust the adjustable pulley as shown in the drawings.`,
      `Example diagram (not to scale):

    D   D
    8   1
    0   2
    2   0
    S   2   S

(Refer to the detailed drawing for exact instructions.)`
    ],
    images: [Picture4]
  },
  {
    id: '3.11',
    title: '3.11 Chain',
    content: [
      `Inspect the chain for proper tension and wear.
Ensure it is free of damage and functioning smoothly.`
    ]
  },
  {
    id: '3.12',
    title: '3.12 Replace and Adjust Tension of Feed Belts',
    content: [
      `- Loosen the bolts on both sides with a 13 mm spanner.
- Move the guide plate toward the feed roll.
- Open the feed bands by removing the lock pin between the connecting hooks.
- After replacing the feed bands, slide the plate back toward the ironing bed and tighten the bolts.
- Ensure that the feed plate is adjusted so that the webs are properly tensioned and close to the ironing bed.`
    ]
  },
  {
    id: '3.13',
    title: '3.13 How to Replace V-Belts',
    content: [
      `The V-belts are installed on the motor and the reduction gearboxes.
If a V-belt is damaged or worn, it must be replaced (it is recommended to replace all V-belts simultaneously).
The V-belts run:
- From the motor to the planetary gearbox (roll 2).
- From the planetary gearbox (roll 2) to the planetary gearbox (roll 1).

Before replacing the belts:
- Access the input/output screen on the touch screen and force the motor brake to open (allowing manual rotation of the pulleys).
- For further details, refer to the extra manual "B&R Mangel".`
    ]
  },
  {
    id: '3.14',
    title: '3.14 Oil Change in Reduction Gearbox',
    content: [
      `Note: Switch off the main switch.
Only change the oil when the machine is cold (below 40°C).`
    ]
  },
  {
    id: '3.15',
    title: '3.15 Placing Tapes Onto the Rolls',
    content: [
      `Placing the first tape (for rolls D802 – K802 – D803 – K803 – D1202):
1. Heat up the ironer until 170°C.
2. Let the rolls run at minimum speed.
3. Insert the tape between the top plate and the finger guard screen.
   (Diagram example:
      D   D
      8   1
      0   2
      2   0
      S   2)
4. If no one is on the ironer, press the start button so the roll pulls the tape through.
5. Once the tape exits the first roll, stop the roll using the finger guard.
6. Guide the tape over the bridge (caution: the bridge is very hot) and allow it to fall into the next roll (do not force it).
7. If a third roll is present, repeat steps 5–7.
8. After the tape exits the last roll, press the start button and manually guide the tape to the front of the ironer.
9. Cut the tape and tie the two ends together.
10. Place the tape onto the tensioning system.

Placing additional tapes:
1. Tie the new tape to the already installed tape.
2. Let the rolls run at minimum speed so the new tape is pulled through.
3. When the tape reaches the front, stop the rolls with the finger guard.
4. Cut the new tape from the installed tape and tie the two ends together.
5. Place the tape onto the tensioning system.`
    ]
  },
  {
    id: '3.16',
    title: '3.16 Cleaning of the Chest',
    content: [
      `A clean chest is essential for both the longevity of the ironer and the quality of the ironed linen.
A dirty chest can cause creases on the leading edge due to residue and salt buildup.

Before cleaning, identify the cause of deposits, which may include:
- Hard water (lime deposits; 5°F to 8°F, approximately 50–80 PPM or 2.8°D to 4.5°D).
- pH values deviating from the ideal 6.5.
- Excess moisture (too much water to evaporate).
- Poor rinsing (soap residues).

Cleaning procedure:
1. If buildup is only at the chest inlet, remove it manually with Scotch-Brite (only when the beds are cold).
2. If buildup is widespread:
   - Drop the chest.
   - Allow the machine to cool (to approximately 100°C).
   - Open the scrapers.
   - Wrap a cloth around the roll to protect the padding.
   - Wind strips of Scotch-Brite around the rollers in wide lanes.
   - Lower the hydraulic pressure to 15 Bar.
   - Press the slightly heated (100°C) chest against the roll and let it rotate for 2–3 hours (monitor to ensure the Scotch-Brite stays in place).
   - Remove all dust, then remove the Scotch-Brite and cloth.
   - Restore the original hydraulic pressure.
   - Heat the bed and run a wax cloth over it to grease the surface.

Additional notes:
- Wax should be applied regularly but sparingly (to avoid clogging the suction system). Always use a cloth and never apply wax between the roll and the bed, as it may cause spots on the ironed linen.
- For long-term storage (seasonal work):
   - Allow the padding to dry out.
   - Apply a wax cloth with plenty of wax to prevent rust.
   - Continue with annual maintenance (oil changes, lubrication, etc.).
Before restarting the ironer, ensure the bed is thoroughly cleaned!`
    ]
  },
  {
    id: '3.17',
    title: '3.17 Roll Padding Replacement',
    content: [
      `If the ironing machine delivers reduced output and lower ironing quality after about 1 year, the padding is likely worn.
The old padding is removed using a reversing switch located in the electrical connection box.

Procedure:
- First, clean the chest (see section 3.16).
- Open the chest (ensure the machine is at rest).
- Disassemble the covers.
- Detach the tapes from the sides of the padding.
- Move the scrapers away from the padding as shown in the drawing.

Next steps:
- Press the designated button to access the "Manual Handling" screen (this option is active only for LACO-trained technicians).
- Reverse the roll (via the service menu) so the old padding unwinds. (Note: The chest may still be warm; ensure the scrapers do not damage the padding.)
- Verify the dimensions of the new padding. (Example for Mod.1200 Padding:)

    Ø Length (mm)    Width (mm)
    2000             5100 × 2200
    2500             5100 × 2700
    3000             5100 × 3200
    3300             5100 × 3500
    3500             5100 × 3700
    4000             5100 × 4200

- Tie a knot in the rope on both sides to prevent it from slipping out.
- Set the machine temperature to at least 120°C.
- Apply glue (type Vitabond VB100).
- Mount the new padding onto the roll by pressing it firmly against the roll, ensuring the ropes are at the bottom.
- Lower the speed via the touch screen, then rotate the roll clockwise using the service menu.
- While the roll is turning, ensure the padding is properly tensioned.
- When the padding enters the chest, stop the roll (using the service menu).
- Close the chest (working pressure must not exceed 15 Bar) and resume rotation. Monitor for smooth operation (use the finger screen or foot pedal to stop if necessary).
- Ensure that the ropes do not become entangled with the padding during rotation.
- Press the sides with a stump object to secure the padding.
- Allow the roll to run if the padding is too short (max 1 hour). If the padding is too long, stop the roll and trim the excess (cut when the third turn begins) so that the padding is evenly layered.
- Note: New padding may stretch initially, causing an overlap that can result in wet spots on the ironed linen. It is recommended to check and adjust the overlap daily at first, then monthly once the padding stabilizes.
- Brush the padding using a steel brush (or a drill with a radial steel brush) to create a smooth finish. Place a wooden plank under the padding to protect other parts.
- After brushing, stop the roll and tie the ropes with three tight knots on each side.
- Finally, allow the roll to run and then reposition the tapes (see section 3.15) or adjust the scrapers before reassembling the covers.
- When all is in order, the new padding is ready for use.

Important: Never operate the roll under pressure on a cold bed, as this can cause the padding to stretch excessively due to increased friction.`
    ]
  },

  // Legacy abbreviated PART 3 section for backward compatibility
  {
    id: 'part3',
    title: 'PART 3: MAINTENANCE INSTRUCTIONS',
    content: [
      `3.1 Maintenance instructions. Check the operation of the safety equipment every day!`,
      `3.2 Other maintenance points.
- On a daily basis: Feed a piece of waxed fabric (cleaning cloth)...
- 12x per year: Check the overlap from the padding
- 4x per year: Clean the turbines on all the motors...
- Every 2 years: Change thermal oil or every 3500 hours...
- ...`,
      `3.3 Possible risks of poor maintenance:
- Rapid wear of sprockets or bearings
- If safety equipment is not checked daily, may lead to serious accidents
- ...`,
      `3.4 Oil types. (Important chart)
Example: Q8 Goya 220, etc. (Mixing different types can lead to blockages.)`,
      `3.5 Troubleshooting guide. Examples:
- Machine does not reach temperature => Steam pressure too low
- Ironing bed does not close => Check hydraulic pump M21, contactor, etc.
- ...`
    ],
    images: [Picture2, Picture3]
  },

  // Legacy padding replacement section for backward compatibility
  {
    id: 'paddingReplacement',
    title: '3.17 Roll Padding Replacement',
    content: [
      `If the ironing machine is delivering reduced output and poorer quality... then the padding is worn. The old padding is easily removed using a reversing switch...`,
      `Step-by-step procedure:
1) Clean the chest
2) Open the chest
3) Disassemble covers
4) Cut or detach tapes...
...
10) Re-check tension after some running time.`,
      `In the beginning, a new padding will stretch, resulting in an overlap. Overlap can cause wet spots. Therefore, we recommended checking the overlap daily...`
    ]
  }
];

// ---------------------
// Parts List Data (Original, short version)
// ---------------------
export const partsListFromManual: ManualSection[] = [
  {
    id: 'partsList1',
    title: 'Engine Components',
    content: [
      'Engine block',
      'Pistons',
      'Crankshaft',
      'Valve Train'
    ]
  },
  {
    id: 'partsList2',
    title: 'Transmission Parts',
    content: [
      'Gearbox',
      'Clutch',
      'Driveshaft',
      'Differential'
    ]
  }
];

// ---------------------
// Interfaces for Detailed Parts List
// ---------------------
export interface PartItem {
  name: string;
  description: string;
  type?: string;
  partNumber: string;
  picture?: string;
}

export interface PartSection {
  category: string;
  parts: PartItem[];
}

// ---------------------
// Detailed Parts List Data
// ---------------------
export const manualParts: PartSection[] = [
  {
    category: 'ROLL DRIVE',
    parts: [
      {
        name: 'M11 (Installed on roll 2)',
        description:
          'Roll drive motor 11 kW / 15 kW / 22 kW',
        partNumber:
          'BA160MB4-11kW-1500rpm-400/690V-B3, Motor15kW - 1460rpm - 230/400 - B3, Motor22kW - 1460rpm - 400/690 - B3, E.ME.1162, E.ME.1562, E.ME.2262'
      },
      {
        name: 'K3',
        description: 'Contactor brake (LP1-K0610 BD)',
        partNumber: 'E.C1.2060'
      },
      {
        name: 'U3',
        description:
          'Frequency inverter for 11 kW / 15 kW / 22 kW',
        partNumber:
          'Freq.omv. B&R ACPI P66-11 kW - 400V PLK, Freq.omv. B&R ACPI P66-15 kW - 400V PLK, Freq.omv. B&R ACPI P86-22 kW - 400V PLK, E.ML.T821, E.ML.T825, E.ML.T832'
      },
      {
        name: 'XT3',
        description: 'Plug folder (Male + female) 4p 2A',
        partNumber: 'E.P1.0054'
      },
      {
        name: 'XM11 (Not when 22kW roll drive motor)',
        description:
          'Fiche; Stekker CEE 5P 32A 380V / Wandkont.doos CEEF 5P 32A 380V',
        partNumber: 'E.P1.0108 / E.P2.0106'
      }
    ]
  },
  {
    category: 'HYDRAULIC PUMP DRIVE',
    parts: [
      // No detailed parts provided in the text.
    ]
  },
  {
    category: 'ROLL SUCTION DRIVE',
    parts: [
      {
        name: 'M31 (Installed on roll 1)',
        description:
          'Roll suction Motor, MOTOR 1.5 KW 3000T 2/4V B3 KKB EMI-AC IE3 90S-2',
        partNumber: 'E.ME.0160'
      },
      {
        name: 'Ventilator fan',
        description: 'TLR 225 x 74 R-E 20A/24H8',
        partNumber: 'T.YA.2250'
      },
      {
        name: 'K31/K32/K33 (When 3 rolls)',
        description: 'Contactor (LP1-K0610 BD)',
        partNumber: 'E.C1.2060'
      },
      {
        name: 'Q31/Q32 (When 3 rolls)',
        description: 'Thermal overload, GV2ME08, 2.5–4 A',
        partNumber: '2LE.TB.GE08'
      },
      {
        name: 'Auxiliary contact',
        description: 'Contact vr beveiliging GVAE1 nc no',
        partNumber: 'E.TB.8150'
      },
      {
        name: 'XM32/XM33 (When 3 rolls)',
        description:
          'Fiche; Stekker CEE 5P 16A 200/415V Mennekes 111 / Wandkont.doos CEEF 5P 16A 380V',
        partNumber: 'E.P1.0102 / E.P2.0105'
      }
    ]
  },
  {
    category: 'SUCTION TROUGH FEEDING BELTS',
    parts: [
      {
        name: 'M41',
        description: 'Roll suction Motor, 0.75 kW / 3000 rpm',
        partNumber: 'E.ME.0108'
      },
      {
        name: 'Ventilator fan',
        description: 'TLR 180 x 74 R-E 21E/19H8',
        partNumber: 'T.YA.1800'
      },
      {
        name: 'K41',
        description: 'Contactor (LP1-K0610 BD)',
        partNumber: 'E.C1.2060'
      },
      {
        name: 'Q41',
        description: 'Thermal overload, GV2ME07, 1.6–2.5 A',
        partNumber: '2LE.TB.GE07'
      },
      {
        name: 'Auxiliary contact',
        description: 'Contact vr beveiliging GVAE1 nc no',
        partNumber: 'E.TB.8150'
      }
    ]
  },
  {
    category: 'COOLING FAN ELECTRICAL BOX',
    parts: [
      {
        name: 'M61/M62',
        description:
          'Cooling fan electrical box, SK FILTER TOPTHERM 255 x 255 SK 3240.100',
        partNumber: 'E.KT.4060'
      }
    ]
  },
  {
    category: 'FUSES',
    parts: [
      {
        name: 'F1 / D1202 (15kW roll drive)',
        description: 'Main fuses 40A, AUT.C60N 4P 40A',
        partNumber: '2LE.Z0.5340'
      },
      {
        name: 'F1 / D1202-D1203 (22kW roll drive)',
        description: 'Main fuses 80A, AUT. 4P 80A (UL)',
        partNumber: '2LE.Z0.5481'
      },
      {
        name: 'F21/F22',
        description:
          'Primary 230V CC fuse 1.5A (cc fuse 1.5A 10,3x38 slow UL) with base (10x38 1P UL)',
        partNumber: 'E.Z1.3401 / E.ZT.1004'
      },
      {
        name: 'F3',
        description:
          'Inputs/Outputs CC fuse, 4A (cc fuse 3A 10,3x38 slow UL) with base (10x38 1P UL)',
        partNumber: 'E.Z1.3404 / E.ZT.1004'
      },
      {
        name: 'F4',
        description: 'Touchscreen 1A (GB2-CB06)',
        partNumber: '2LE.TB.CB06'
      },
      {
        name: 'F51/F52',
        description:
          'Cooling fan CC fuse, 4A (cc fuse 3A 10,3x38 slow UL) with base (10x38 1P UL)',
        partNumber: 'E.Z1.3404 / E.ZT.1004'
      },
      {
        name: 'F6',
        description: 'Brake 1A (GB2-CB06)',
        partNumber: '2LE.TB.CB06'
      },
      {
        name: 'F7',
        description:
          'Frequency inverter fuse; For 11 & 15 kW: GV3L40, part 2LE.TB.GL43; for 22 kW: GV4P80B, part 2LE.TB.GP80',
        partNumber: '2LE.TB.GL43 / 2LE.TB.GP80'
      }
    ]
  },
  {
    category: 'CONTROL PANEL',
    parts: [
      {
        name: 'S11/S21/S12/S22',
        description:
          'Emergency contacts; ZB4 BS54 + ZB4 BZ102 (NC)',
        partNumber: 'E.SD.Z215 + E.SD.Z231'
      },
      {
        name: 'S5',
        description:
          'Black pushbutton – Reset; ZB4 BA2, ZB4 BZ101',
        partNumber: 'E.SD.Z192, E.SD.Z211, E.SD.Z230'
      },
      {
        name: 'A1',
        description: 'PPC70 "touch 7" TFT color, X2X, ethernet',
        partNumber: 'Z.Z1.0835'
      },
      {
        name: 'USB Memory Stick',
        description: '2048MB B&R (for new software on the PPC70 screen)',
        partNumber: 'Z.Z1.0852'
      },
      {
        name: 'Powerlink 1',
        description:
          'Connection between touch screen and frequency inverter (PLK/Ethernet, RJ45 2m)',
        partNumber: 'Z.Z1.1150'
      },
      {
        name: 'Fan Filter 120 mm',
        description: 'Fan filter 120 mm',
        partNumber: 'E.KT.4120'
      }
    ]
  },
  {
    category: 'REMOTE CONTROL',
    parts: [
      {
        name: 'S6/S7',
        description: 'Remote control box',
        partNumber: 'E.SD.Z992'
      }
    ]
  },
  {
    category: 'B&R MODULES',
    parts: [
      {
        name: 'B&R module X20BR9300 (A2)',
        description:
          'Base, X2X receiver + power supply, End block 12-pin',
        partNumber:
          'X20BM01 X20BR9300; X20TB12; Z.Z1.0140, Z.Z1.0020, Z.Z1.0130'
      },
      {
        name: 'B&R module X20DI8371 (A3)',
        description:
          'X20 digital input module, 8 inputs, 24 VDC, End block 12-pin',
        partNumber:
          'X20BM11 X20DI8371; X20TB12; Z.Z1.0150, Z.Z1.0045, Z.Z1.0130'
      },
      {
        name: 'B&R module X20DO8322 (A4)',
        description:
          'X20 Digital 8×O, 24V 0.5A, source 1W, End block 12-pin',
        partNumber:
          'X20BM11 X20DO8322; X20TB12; Z.Z1.0150, Z.Z1.0055, Z.Z1.0130'
      },
      {
        name: 'B&R module X20CM8281 (A5)',
        description:
          'Mix, 4 inputs (2 as counters), 2 outputs 24 VDC/0.5A, 1 AI + 1 AO, End block 12-pin',
        partNumber:
          'X20BM11 X20CM8281; X20TB12; Z.Z1.0150, Z.Z1.1120, Z.Z1.0130'
      },
      {
        name: 'B&R module X20AT4222 (A6)',
        description:
          'X20 temperature input module, 4 inputs for resistance measurement (PT100/PT1000), End block 12-pin',
        partNumber:
          'X20BM11 X20AT4222; X20TB12; Z.Z1.0150, Z.Z1.0110, Z.Z1.0130'
      },
      {
        name: 'B&R module X20CM8281 (A9)',
        description:
          'Mix, 4 inputs (2 as counters), 2 outputs 24 VDC/0.5A, 1 AI + 1 AO, End block 12-pin',
        partNumber:
          'X20BM15 X20CM8281; X20TB12; Z.Z1.0154, Z.Z1.1120, Z.Z1.0130'
      }
    ]
  },
  {
    category: 'B&R MODULES BINAIRY CODE PROGRAM CHANGE',
    parts: [
      {
        name: 'B&R module X20DI6371 (A21)',
        description:
          'Input module, 6 channels 24 VDC sink 1 wire, End block 12-pin',
        partNumber:
          'X20BM15 X20DI6371; X20TB12; Z.Z1.0154, Z.Z1.1100, Z.Z1.0130'
      },
      {
        name: 'B&R module X20DO6322 (A22)',
        description:
          'Output module, 6 channels 24VDC 10.5A, End block 12-pin',
        partNumber:
          'X20BM11 X20DO6322; X20TB12; Z.Z1.0150, Z.Z1.0065, Z.Z1.0130'
      }
    ]
  },
  {
    category: 'OTHER',
    parts: [
      {
        name: 'Q1 (Main switch, 15kW roll drive)',
        description:
          'Main switch for 15kW roll drive; D1202, VBF2 3P 40A, VZ11 (N-pol VZ14, PE-pol)',
        partNumber: 'E.SV.5040, E.SV.5042, E.SV.5044'
      },
      {
        name: 'Q1 (Main switch, 22kW roll drive)',
        description:
          'Main switch for 22kW roll drive; D1202–D1203, VBF4 3P 80A, VZ12 (N-pol VZ15, PE-pol)',
        partNumber: 'E.SV.5080, E.SV.5082, E.SV.5084'
      },
      {
        name: 'K91',
        description:
          'Relay, Omron 24 VDC (Foot for Relais TE RXN41G11B7, Relais 4P 24V DC)',
        partNumber: '2LE.RK.T011, E.RK.O344'
      },
      {
        name: 'K2',
        description: 'Relay, Omron 230 24 VDC, G2 RV – SL700',
        partNumber: 'E.RK.W175'
      },
      {
        name: 'K9/K10',
        description: 'Emergency stop relay, XPSAC5121 24 AC/VDC',
        partNumber: 'E.RL.RN05'
      },
      {
        name: 'T1',
        description:
          'Transformer, Inelmatec – Nex Voeding met ingang 187...550Vac, DC 5A, 615 NPSW12024',
        partNumber: 'E.O2.0037'
      },
      {
        name: 'FDC2',
        description:
          'Finger guard contact (draad + wiel: TEL.ZCMD29L2 + TEL.ZCE02)',
        partNumber: 'E.SB.T075'
      },
      {
        name: 'B21 (Installed on roll 1)',
        description:
          'Temperature sensor, PT100 SL 28 X 15 X 6 MESS 1000',
        partNumber: 'E.O3.0016'
      },
      {
        name: 'FC8/FC9',
        description: 'Photocell (with reflection) QS18VP6LP',
        partNumber: 'E.F4.5320'
      },
      {
        name: 'H1',
        description: 'Beeper, 24V DC/AC',
        partNumber: 'Z.Z0.0008'
      },
      {
        name: 'X120 (Connection roll 2)',
        description:
          'Stekker 24P-Polig – 19300241752 + Stekker 24P-Polig - 09330242601; Sokkel Harting – 09300240307 + Stekker 24P-Polig - 09330242701',
        partNumber: 'E.P1.0042 + E.P1.0040; E.P1.0045 + E.P1.0041'
      }
    ]
  }
];
