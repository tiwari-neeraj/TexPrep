"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { AuthScreen, ForgotScreen, HistoryScreen, saveSession } from "./AuthScreens";
import { AdminPanel } from "./AdminPanel";

// ── Inline data (ISD + Questions) ──────────────────────────────────────────

const TEXAS_ISDS = [
  { id: "TX001", name: "Houston ISD", city: "Houston", zips: ["77001","77002","77003","77004","77005","77006","77007","77008","77009","77010","77011","77012","77013","77014","77015","77016","77017","77018","77019","77020","77021","77022","77023","77024","77025","77026","77027","77028","77029","77030","77031","77032","77033","77034","77035","77036","77037","77038","77039","77040","77041","77042","77043","77044","77045","77046","77047","77048","77049","77050","77051","77052","77053","77054","77055","77056","77057","77058","77059","77060","77061","77062","77063","77064","77065","77066","77067","77068","77069","77070","77071","77072","77073","77074","77075","77076","77077","77078","77079","77080","77081","77082","77083","77084","77085","77086","77087","77088","77089","77090","77091","77092","77093","77094","77095","77096","77097","77098","77099"] },
  { id: "TX002", name: "Dallas ISD", city: "Dallas", zips: ["75201","75202","75203","75204","75205","75206","75207","75208","75209","75210","75211","75212","75214","75215","75216","75217","75218","75219","75220","75221","75222","75223","75224","75225","75226","75227","75228","75229","75230","75231","75232","75233","75234","75235","75236","75237","75238","75239","75240","75241","75242","75243","75244","75245","75246","75247","75248","75249","75250","75251","75252","75253","75254"] },
  { id: "TX003", name: "San Antonio ISD", city: "San Antonio", zips: ["78201","78202","78203","78204","78205","78206","78207","78208","78209","78210","78211","78212","78213","78214","78215","78216","78217","78218","78219","78220","78221","78222","78223","78224","78225","78226","78227","78228","78229","78230","78231","78232","78233","78234","78235","78236","78237","78238","78239","78240","78241","78242","78243","78244","78245","78246","78247","78248","78249","78250","78251","78252","78253","78254","78255","78256","78257","78258","78259","78260"] },
  { id: "TX004", name: "Austin ISD", city: "Austin", zips: ["78701","78702","78703","78704","78705","78712","78717","78719","78721","78722","78723","78724","78725","78726","78727","78728","78729","78730","78731","78732","78733","78734","78735","78736","78737","78738","78739","78741","78742","78744","78745","78746","78747","78748","78749","78750","78751","78752","78753","78754","78756","78757","78758","78759"] },
  { id: "TX005", name: "Fort Worth ISD", city: "Fort Worth", zips: ["76101","76102","76103","76104","76105","76106","76107","76108","76109","76110","76111","76112","76113","76114","76115","76116","76117","76118","76119","76120","76121","76122","76123","76124","76126","76127","76129","76130","76131","76132","76133","76134","76135","76136","76137","76140","76147","76148","76150","76155","76161","76162","76163","76164","76177","76179","76180","76182","76185"] },
  { id: "TX006", name: "El Paso ISD", city: "El Paso", zips: ["79901","79902","79903","79904","79905","79906","79907","79908","79910","79911","79912","79913","79914","79915","79916","79917","79918","79920","79922","79923","79924","79925","79926","79927","79928","79929","79930","79931","79932","79934","79935","79936","79937","79938"] },
  { id: "TX007", name: "Arlington ISD", city: "Arlington", zips: ["76001","76002","76006","76010","76011","76012","76013","76014","76015","76016","76017","76018","76019"] },
  { id: "TX008", name: "Plano ISD", city: "Plano", zips: ["75023","75024","75025","75026","75074","75075","75086","75093","75094"] },
  { id: "TX009", name: "Garland ISD", city: "Garland", zips: ["75040","75041","75042","75043","75044","75045","75046","75047","75048","75049","75150","75180","75181","75182","75185","75187","75189"] },
  { id: "TX010", name: "Cypress-Fairbanks ISD", city: "Houston", zips: ["77040","77041","77064","77065","77070","77084","77095","77429","77433","77449","77450","77493","77494"] },
  { id: "TX011", name: "Northside ISD", city: "San Antonio", zips: ["78023","78073","78109","78238","78240","78245","78249","78250","78251","78252","78253","78254","78255","78256","78257","78258","78259","78260"] },
  { id: "TX012", name: "Katy ISD", city: "Katy", zips: ["77079","77094","77095","77099","77406","77407","77423","77449","77450","77493","77494"] },
  { id: "TX013", name: "Lewisville ISD", city: "Lewisville", zips: ["75007","75010","75019","75022","75027","75028","75029","75056","75057","75067","75068","75077","75078","75234","75287"] },
  { id: "TX014", name: "McKinney ISD", city: "McKinney", zips: ["75069","75070","75071","75072","75169"] },
  { id: "TX015", name: "Frisco ISD", city: "Frisco", zips: ["75033","75034","75035","75036","75068","75069","75070","75071","75078","75252","75287"] },
  { id: "TX016", name: "Round Rock ISD", city: "Round Rock", zips: ["78613","78617","78626","78628","78630","78634","78641","78660","78664","78665","78681","78682","78717","78726","78728","78729","78750","78753","78757","78758","78759"] },
  { id: "TX017", name: "Humble ISD", city: "Humble", zips: ["77044","77049","77060","77067","77068","77069","77073","77090","77339","77345","77346","77347","77388","77396"] },
  { id: "TX018", name: "Conroe ISD", city: "Conroe", zips: ["77301","77302","77303","77304","77305","77306","77316","77318","77326","77327","77328","77338","77340","77341","77342","77384","77385","77386","77388","77389"] },
  { id: "TX019", name: "Aldine ISD", city: "Houston", zips: ["77015","77016","77022","77026","77028","77032","77037","77038","77039","77060","77061","77066","77067","77073","77076","77086","77088","77090","77091","77093"] },
  { id: "TX020", name: "Frisco ISD", city: "Frisco", zips: ["75033","75034","75035","75036"] },
  { id: "TX021", name: "Pasadena ISD", city: "Pasadena", zips: ["77012","77017","77034","77058","77059","77061","77075","77087","77089","77502","77503","77504","77505","77506","77507","77508"] },
  { id: "TX022", name: "Irving ISD", city: "Irving", zips: ["75014","75015","75016","75017","75038","75039","75060","75061","75062","75063"] },
  { id: "TX023", name: "Killeen ISD", city: "Killeen", zips: ["76501","76502","76503","76504","76505","76506","76507","76508","76509","76522","76539","76540","76541","76542","76543","76544","76548","76549"] },
  { id: "TX024", name: "Waco ISD", city: "Waco", zips: ["76701","76702","76703","76704","76705","76706","76707","76708","76710","76711","76712","76714","76715","76716"] },
  { id: "TX025", name: "Amarillo ISD", city: "Amarillo", zips: ["79101","79102","79103","79104","79105","79106","79107","79108","79109","79110","79111","79114","79116","79117","79118","79119","79120","79121","79123","79124"] },
  { id: "TX026", name: "Laredo ISD", city: "Laredo", zips: ["78040","78041","78042","78043","78044","78045","78046"] },
  { id: "TX027", name: "Lubbock ISD", city: "Lubbock", zips: ["79401","79402","79403","79404","79405","79406","79407","79408","79409","79410","79411","79412","79413","79414","79415","79416","79417","79418","79419","79420","79423","79424"] },
  { id: "TX028", name: "Corpus Christi ISD", city: "Corpus Christi", zips: ["78401","78402","78403","78404","78405","78406","78407","78408","78409","78410","78411","78412","78413","78414","78415","78416","78417","78418","78419"] },
  { id: "TX029", name: "Celina ISD", city: "Celina", zips: ["75009","76247","76272"] },
  { id: "TX030", name: "Allen ISD", city: "Allen", zips: ["75002","75013"] },
  { id: "TX031", name: "Denton ISD", city: "Denton", zips: ["76201","76202","76203","76204","76205","76206","76207","76208","76209","76210","76226","76227"] },
  { id: "TX032", name: "Mansfield ISD", city: "Mansfield", zips: ["76001","76002","76006","76028","76036","76063","76065","76084"] },
  { id: "TX033", name: "Midland ISD", city: "Midland", zips: ["79701","79702","79703","79704","79705","79706","79707","79708","79710","79711","79712"] },
  { id: "TX034", name: "Tyler ISD", city: "Tyler", zips: ["75701","75702","75703","75704","75705","75706","75707","75708","75709","75710","75711","75712","75713"] },
  { id: "TX035", name: "Brownsville ISD", city: "Brownsville", zips: ["78520","78521","78522","78523","78526","78550","78551","78552","78553"] },
  { id: "TX036", name: "McAllen ISD", city: "McAllen", zips: ["78501","78502","78503","78504","78505","78538","78539","78557","78574"] },
  { id: "TX037", name: "Clear Creek ISD", city: "League City", zips: ["77058","77059","77062","77089","77546","77565","77573","77574","77598"] },
  { id: "TX038", name: "Spring ISD", city: "Spring", zips: ["77014","77066","77067","77068","77069","77073","77090","77373","77379","77388","77389","77396"] },
  { id: "TX039", name: "Alief ISD", city: "Houston", zips: ["77072","77082","77083","77099"] },
  { id: "TX040", name: "Klein ISD", city: "Klein", zips: ["77014","77064","77065","77066","77379","77380","77381","77382","77383","77388","77389","77429","77433"] },
];

function searchISD(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  if (/^\d{3,5}$/.test(q)) {
    const r = TEXAS_ISDS.filter(d => d.zips.includes(q));
    if (r.length) return r;
  }
  return TEXAS_ISDS.filter(d =>
    d.city.toLowerCase().includes(q) || d.name.toLowerCase().includes(q)
  ).slice(0, 6);
}

// ── CONFIGURABLE LINKS ───────────────────────────────────────────────────
// Donate: paste your Buy Me a Coffee / Ko-fi / PayPal.me link here.
// Feedback: paste your Google Form link here (create a free form at forms.google.com).
const DONATE_URL = "https://ko-fi.com/texprep";
const FEEDBACK_URL = "https://docs.google.com/forms/d/e/1FAIpQLSflJ-3w8K6zOAJnwR1U6LJJi1v5J6YECnBazEP2ar73_WrabQ/viewform";

const US_STATES = [
  ["TX","Texas"],["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
  ["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["DC","Washington DC"],["FL","Florida"],["GA","Georgia"],
  ["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],
  ["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],
  ["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],
  ["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],
  ["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],
  ["SD","South Dakota"],["TN","Tennessee"],["UT","Utah"],["VT","Vermont"],["VA","Virginia"],["WA","Washington"],
  ["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]
];
const stateName = (code) => (US_STATES.find(([c]) => c === code) || ["", code])[1];

// ── STATE VISIBILITY SWITCH ──────────────────────────────────────────────
// All 50 states + DC are fully built and dormant. To control which states are
// VISIBLE/SELECTABLE to users, edit LIVE_STATES below. Nothing is deleted —
// hidden states keep their code, districts, and any generated content.
//
//   Texas-only (current):   const LIVE_STATES = ["TX"];
//   All states (future):    const LIVE_STATES = US_STATES.map(([code]) => code);
//
// When you flip to all states, also remove the GEN_STATES secret in GitHub so
// the nightly generator resumes building every state.
const LIVE_STATES = ["TX"];
const LIVE_STATE_OPTIONS = US_STATES.filter(([code]) => LIVE_STATES.includes(code));

// Official state achievement test by state (2025-26). Source: state DOE sites.
// Used to label the test-prep mode correctly per state. Default fallback: "State Test Prep".
const STATE_TEST = {
  TX:"STAAR", FL:"FAST", CA:"CAASPP", NY:"NYS Tests", MA:"MCAS", GA:"Georgia Milestones",
  OH:"Ohio State Tests", IL:"IAR", PA:"PSSA", NC:"EOG/EOC", MI:"M-STEP", NJ:"NJSLA",
  VA:"SOL", AZ:"AzM2", IN:"ILEARN", TN:"TNReady", MO:"MAP", WI:"Forward Exam",
  CO:"CMAS", MD:"MCAP", MN:"MCA", LA:"LEAP", AL:"ACAP", SC:"SC READY", KY:"KSA",
  OK:"OSTP", CT:"Smarter Balanced", OR:"OSAS", UT:"RISE", IA:"ISASP", AR:"ATLAS",
  MS:"MAAP", KS:"KAP", NV:"Smarter Balanced", NM:"NM-MSSA", WA:"Smarter Balanced",
  WV:"WVGSA", NE:"NSCAS", ID:"ISAT", NH:"NH SAS", ME:"MEA", HI:"SBA", RI:"RICAS",
  MT:"Smarter Balanced", DE:"DeSSA", SD:"Smarter Balanced", ND:"ND A+", AK:"AK STAR",
  VT:"Smarter Balanced", WY:"WY-TOPP", DC:"DC CAPE",
};
const stateTestName = (code) => STATE_TEST[code] || "State Test";


// ── Question Bank ──────────────────────────────────────────────────────────

const QB = {
  "3": {
    math: [
      { id:"3m1", q:"Maria has 24 crayons and gives 8 to her friend. How many does she have left?", opts:["14","16","18","12"], ans:1, teks:"3.4A", exp:"24 − 8 = 16 crayons remain." },
      { id:"3m2", q:"What is the value of the digit 7 in 573?", opts:["7","70","700","7,000"], ans:1, teks:"3.2A", exp:"The 7 is in the tens place → value is 70." },
      { id:"3m3", q:"A rectangle is 6 cm long and 4 cm wide. What is its perimeter?", opts:["10 cm","20 cm","24 cm","12 cm"], ans:1, teks:"3.7B", exp:"P = 2×(6+4) = 20 cm." },
      { id:"3m4", q:"Which fraction equals one-half?", opts:["2/6","3/6","2/4","4/6"], ans:2, teks:"3.3A", exp:"2/4 = 1/2." },
      { id:"3m5", q:"5 shelves with 9 books each. How many books total?", opts:["14","40","45","54"], ans:2, teks:"3.4D", exp:"5 × 9 = 45 books." },
      { id:"3m6", q:"What is 8 × 7?", opts:["54","56","48","64"], ans:1, teks:"3.4E", exp:"8 × 7 = 56." },
      { id:"3m7", q:"Which shape has exactly 4 equal sides?", opts:["Rectangle","Triangle","Square","Pentagon"], ans:2, teks:"3.6A", exp:"A square has 4 equal sides." },
      { id:"3m8", q:"Red=8, Blue=12, Green=5 classmates. How many students total?", opts:["20","25","17","15"], ans:1, teks:"3.8A", exp:"8 + 12 + 5 = 25 students." },
      { id:"3m9", q:"A bag of apples costs $3. How much for 6 bags?", opts:["$9","$18","$15","$24"], ans:1, teks:"3.4K", exp:"6 × $3 = $18." },
      { id:"3m10", q:"Round 347 to the nearest ten.", opts:["300","340","350","400"], ans:2, teks:"3.2B", exp:"The ones digit is 7 ≥ 5, so round up: 350." },
    ],
    ela: [
      { id:"3e1", q:"Which word is a synonym for 'happy'?", opts:["Sad","Joyful","Angry","Tired"], ans:1, teks:"3.3B", exp:"'Joyful' means feeling great happiness." },
      { id:"3e2", q:"'The blazing sun beat down on the dry desert.' What does 'blazing' mean?", opts:["Cold","Hiding","Extremely hot","Rising"], ans:2, teks:"3.3A", exp:"Context clues 'beat down' and 'dry desert' indicate extremely hot." },
      { id:"3e3", q:"Which sentence uses a comma correctly in a list?", opts:["I like cats dogs and fish.","I like cats, dogs, and fish.","I like, cats dogs, and fish.","I like cats, dogs and, fish."], ans:1, teks:"3.11C", exp:"Use commas to separate items in a list." },
      { id:"3e4", q:"What is the main purpose of a table of contents?", opts:["Show pictures","Tell where chapters begin","Give the author's name","Explain difficult words"], ans:1, teks:"3.10A", exp:"A table of contents lists chapters and page numbers." },
      { id:"3e5", q:"Which word uses the prefix 'un-' meaning 'not'?", opts:["Under","Unhappy","Uncle","Until"], ans:1, teks:"3.3C", exp:"Unhappy = un (not) + happy." },
      { id:"3e6", q:"In a story, the 'setting' refers to:", opts:["The main character","When and where the story takes place","The problem in the story","The ending"], ans:1, teks:"3.6A", exp:"Setting = time and place of a story." },
      { id:"3e7", q:"Which sentence is a compound sentence?", opts:["The dog ran fast.","She sang, and he danced.","Running in the park.","Blue is my favorite."], ans:1, teks:"3.11A", exp:"Compound = two complete thoughts joined by a conjunction." },
      { id:"3e8", q:"A book about making a science project volcano is:", opts:["Fiction","Fairy tale","Nonfiction","Poetry"], ans:2, teks:"3.10A", exp:"Real information and instructions = nonfiction." },
      { id:"3e9", q:"What does the root 'port' mean in 'transport' and 'portable'?", opts:["See","Carry","Walk","Write"], ans:1, teks:"3.3C", exp:"Port = carry." },
      { id:"3e10", q:"Which sentence has correct capitalization?", opts:["we visited dallas last summer.","We visited Dallas last summer.","We visited dallas last summer.","we visited Dallas Last summer."], ans:1, teks:"3.11B", exp:"Capitalize sentence starts and proper nouns like Dallas." },
    ],
    science: [
      { id:"3sc1", q:"What do plants need to make food through photosynthesis?", opts:["Water only","Sunlight only","Sunlight, water, and CO₂","Soil and worms"], ans:2, teks:"3.10A", exp:"Plants need sunlight, water, and carbon dioxide for photosynthesis." },
      { id:"3sc2", q:"Which is a physical property of a rock?", opts:["Its age","Its color and texture","Where it was found","How it formed"], ans:1, teks:"3.5A", exp:"Color and texture are observable physical properties." },
      { id:"3sc3", q:"A caterpillar changing into a butterfly is:", opts:["Adaptation","Metamorphosis","Photosynthesis","Migration"], ans:1, teks:"3.10C", exp:"Metamorphosis is the dramatic physical transformation." },
      { id:"3sc4", q:"Which weather tool measures temperature?", opts:["Barometer","Anemometer","Thermometer","Rain gauge"], ans:2, teks:"3.8A", exp:"A thermometer measures temperature." },
      { id:"3sc5", q:"Which of these is a natural resource?", opts:["Plastic bottle","Solar energy","Glass window","Computer"], ans:1, teks:"3.9A", exp:"Solar energy is a natural resource from the sun." },
      { id:"3sc6", q:"What happens when you mix baking soda and vinegar?", opts:["Nothing","They freeze","They produce bubbles (gas)","They turn to water"], ans:2, teks:"3.5C", exp:"A chemical reaction produces CO₂ gas (bubbles)." },
      { id:"3sc7", q:"Which animal is a mammal?", opts:["Eagle","Salmon","Dolphin","Lizard"], ans:2, teks:"3.10A", exp:"Dolphins breathe air, are warm-blooded, and nurse young." },
      { id:"3sc8", q:"What is the main source of energy for Earth?", opts:["The moon","The wind","The sun","The ocean"], ans:2, teks:"3.8B", exp:"The sun is Earth's primary energy source." },
      { id:"3sc9", q:"Soil, water, and air are examples of:", opts:["Manufactured goods","Natural resources","Chemical compounds","Living organisms"], ans:1, teks:"3.9A", exp:"Natural resources are materials found in nature." },
      { id:"3sc10", q:"Which phase of matter has a definite shape and volume?", opts:["Gas","Liquid","Solid","Plasma"], ans:2, teks:"3.5A", exp:"Solids have a definite shape AND volume." },
    ],
    social: [
      { id:"3ss1", q:"What is the capital of Texas?", opts:["Houston","Dallas","Austin","San Antonio"], ans:2, teks:"3.4", exp:"Austin is the capital of Texas." },
      { id:"3ss2", q:"A map legend is used to:", opts:["Show scale","Explain what symbols mean","Point to north","Show the title"], ans:1, teks:"3.5A", exp:"A legend explains map symbols." },
      { id:"3ss3", q:"Which is a responsibility of a good citizen?", opts:["Breaking rules","Voting and following laws","Ignoring problems","Littering"], ans:1, teks:"3.12", exp:"Good citizens vote, follow laws, and help their community." },
      { id:"3ss4", q:"Who was the first U.S. President?", opts:["Abraham Lincoln","Thomas Jefferson","George Washington","Benjamin Franklin"], ans:2, teks:"3.11", exp:"George Washington was inaugurated in 1789." },
      { id:"3ss5", q:"Which of these is a need (not a want)?", opts:["Toys","Food","Video games","Vacation"], ans:1, teks:"3.7", exp:"Needs = required for survival: food, water, shelter, clothing." },
      { id:"3ss6", q:"The Rio Grande forms part of Texas's border with which country?", opts:["Canada","Mexico","France","Cuba"], ans:1, teks:"3.4", exp:"The Rio Grande borders Texas and Mexico." },
      { id:"3ss7", q:"What document states all people are created equal?", opts:["The Constitution","The Declaration of Independence","The Bill of Rights","The Emancipation Proclamation"], ans:1, teks:"3.11", exp:"The Declaration of Independence (1776) states this." },
      { id:"3ss8", q:"A person who starts their own business is called an:", opts:["Employee","Entrepreneur","Consumer","Producer"], ans:1, teks:"3.7", exp:"An entrepreneur starts and runs a business." },
      { id:"3ss9", q:"Which direction is at the top of a standard map?", opts:["South","East","North","West"], ans:2, teks:"3.5A", exp:"North is at the top on standard maps." },
      { id:"3ss10", q:"What do we call the study of past events?", opts:["Geography","Economy","History","Civics"], ans:2, teks:"3.1", exp:"History is the study of past events." },
    ],
  },
  "5": {
    math: [
      { id:"5m1", q:"What is 3.45 + 2.8?", opts:["5.25","6.25","5.35","6.35"], ans:1, teks:"5.3A", exp:"3.45 + 2.80 = 6.25." },
      { id:"5m2", q:"Volume of a rectangular prism: 4cm × 3cm × 5cm?", opts:["12 cm³","60 cm³","47 cm³","20 cm³"], ans:1, teks:"5.6B", exp:"V = 4×3×5 = 60 cm³." },
      { id:"5m3", q:"Simplify 18/24.", opts:["3/4","2/3","3/8","9/12"], ans:0, teks:"5.3C", exp:"GCF = 6. 18÷6=3, 24÷6=4 → 3/4." },
      { id:"5m4", q:"What is 0.4 × 0.6?", opts:["2.4","0.24","0.024","24"], ans:1, teks:"5.3D", exp:"0.4×0.6 = 0.24 (2 decimal places)." },
      { id:"5m5", q:"A recipe needs 2/3 cup sugar. Triple the recipe — how much sugar?", opts:["1 cup","2 cups","1½ cups","6/3 cups"], ans:1, teks:"5.3I", exp:"2/3 × 3 = 6/3 = 2 cups." },
      { id:"5m6", q:"In 4×(3+2)−5, what operation do you do FIRST?", opts:["Multiply 4×3","Add 3+2","Subtract 5","Multiply 4×5"], ans:1, teks:"5.4E", exp:"Parentheses first (PEMDAS): 3+2=5." },
      { id:"5m7", q:"Point (3,4) is in which quadrant?", opts:["Quadrant II","Quadrant III","Quadrant IV","Quadrant I"], ans:3, teks:"5.8A", exp:"Positive x and y → Quadrant I." },
      { id:"5m8", q:"What is the prime factorization of 36?", opts:["2×18","2²×3²","4×9","2×2×9"], ans:1, teks:"5.4A", exp:"36 = 2² × 3²." },
      { id:"5m9", q:"Bag has 3 red, 4 blue, 5 green marbles. P(blue)?", opts:["1/4","1/3","4/12 = 1/3","4/7"], ans:2, teks:"5.8C", exp:"4/12 = 1/3." },
      { id:"5m10", q:"What is the LCM of 4 and 6?", opts:["2","8","12","24"], ans:2, teks:"5.3A", exp:"LCM(4,6) = 12." },
    ],
    ela: [
      { id:"5e1", q:"Which sentence has correct subject-verb agreement?", opts:["The team are playing well.","The team is playing well.","The teams is playing well.","The team were playing well."], ans:1, teks:"5.11A", exp:"Collective nouns like 'team' use singular verbs." },
      { id:"5e2", q:"What is the purpose of a thesis statement?", opts:["To end the essay","To give the main idea or argument","To list all details","To provide evidence"], ans:1, teks:"5.12A", exp:"A thesis states the essay's central argument." },
      { id:"5e3", q:"'The hurricane's howling winds' — what literary device is 'howling'?", opts:["Personification","Simile","Alliteration","Onomatopoeia"], ans:0, teks:"5.7", exp:"Giving wind a human/animal quality (howling) = personification." },
      { id:"5e4", q:"'Benevolent teacher stayed to help struggling students.' What does 'benevolent' mean?", opts:["Strict","Kind and generous","Famous","Young"], ans:1, teks:"5.3A", exp:"Context: helping students = kind and generous." },
      { id:"5e5", q:"When you 'infer' from a text, you:", opts:["Copy exact words","Use clues to figure out unstated meaning","Summarize the passage","Look up words"], ans:1, teks:"5.6B", exp:"Inference uses clues + knowledge to understand unstated ideas." },
      { id:"5e6", q:"What does the suffix '-ous' mean in 'courageous'?", opts:["Without","Full of / having","Before","Not"], ans:1, teks:"5.3C", exp:"-ous means 'full of/having': courageous = having courage." },
      { id:"5e7", q:"A text that presents two sides of an argument is:", opts:["Fiction","Narrative","Expository","Persuasive"], ans:3, teks:"5.10A", exp:"Persuasive/argumentative texts present viewpoints and arguments." },
      { id:"5e8", q:"Which is the best source for current events?", opts:["A textbook from 2010","A newspaper or news website","A dictionary","A novel"], ans:1, teks:"5.10A", exp:"Newspapers and news sites provide current, updated information." },
      { id:"5e9", q:"What is the 'climax' of a story?", opts:["The introduction","The turning point/most exciting moment","The resolution","The setting"], ans:1, teks:"5.6A", exp:"The climax is the peak of tension/most exciting moment in a story." },
      { id:"5e10", q:"Which uses an em dash correctly?", opts:["He ran—fast.","He—ran fast.","He ran — to the store he loved.","He was nervous—his hands were shaking."], ans:3, teks:"5.11A", exp:"Em dashes add emphasis or an aside: nervous—his hands were shaking." },
    ],
    science: [
      { id:"5sc1", q:"Which layer of Earth is thinnest?", opts:["Inner core","Outer core","Mantle","Crust"], ans:3, teks:"5.7A", exp:"The crust is 5–70 km thick, far thinner than other layers." },
      { id:"5sc2", q:"A lunar eclipse occurs during which moon phase?", opts:["New moon","Waxing crescent","Full moon","First quarter"], ans:2, teks:"5.8C", exp:"Lunar eclipses occur when Earth's shadow covers the full moon." },
      { id:"5sc3", q:"Glucose + Oxygen → CO₂ + Water + Energy. This is:", opts:["Photosynthesis","Cellular respiration","Condensation","Fermentation"], ans:1, teks:"5.10A", exp:"Cellular respiration breaks glucose down to release energy." },
      { id:"5sc4", q:"Which is a physical change?", opts:["Wood burning","Iron rusting","Tearing paper","Milk souring"], ans:2, teks:"5.5A", exp:"Tearing paper changes shape, not substance = physical change." },
      { id:"5sc5", q:"What is the function of plant roots?", opts:["Produce food via photosynthesis","Absorb water and nutrients from soil","Release oxygen","Attract pollinators"], ans:1, teks:"5.10B", exp:"Roots absorb water and minerals and anchor the plant." },
      { id:"5sc6", q:"What causes seasons on Earth?", opts:["Distance from the sun","Earth's tilted axis as it orbits","Speed of Earth's rotation","The moon's gravity"], ans:1, teks:"5.8A", exp:"Earth's axial tilt causes different parts to receive different sunlight intensity." },
      { id:"5sc7", q:"Which is an example of a conductor?", opts:["Rubber","Wood","Copper wire","Plastic"], ans:2, teks:"5.6A", exp:"Copper is an excellent electrical conductor." },
      { id:"5sc8", q:"What is the role of producers in a food chain?", opts:["Eat other organisms","Make energy from sunlight (plants)","Break down dead matter","Eat only plants"], ans:1, teks:"5.9A", exp:"Producers (plants) use photosynthesis to create energy from sunlight." },
      { id:"5sc9", q:"Sound travels fastest through which medium?", opts:["Vacuum","Air","Water","Solids"], ans:3, teks:"5.7B", exp:"Sound travels fastest through solids (particles are closest together)." },
      { id:"5sc10", q:"Which best describes the water cycle?", opts:["Water is created by rain","Water continuously moves between land, ocean, and atmosphere","Water disappears into clouds","Water only moves from oceans to clouds"], ans:1, teks:"5.8D", exp:"The water cycle is continuous: evaporation → condensation → precipitation → runoff." },
    ],
    social: [
      { id:"5ss1", q:"Which document established the three branches of U.S. government?", opts:["Declaration of Independence","Bill of Rights","The U.S. Constitution","The Federalist Papers"], ans:2, teks:"5.14", exp:"The Constitution (1787) created the three branches of government." },
      { id:"5ss2", q:"The Civil War was primarily fought over:", opts:["Taxation","Westward expansion","Slavery and states' rights","Foreign trade"], ans:2, teks:"5.6", exp:"The Civil War (1861-1865) was primarily about slavery and states' rights." },
      { id:"5ss3", q:"What was the significance of the Louisiana Purchase (1803)?", opts:["It ended the Civil War","It roughly doubled the size of the U.S.","It gave women the vote","It created the Bill of Rights"], ans:1, teks:"5.3", exp:"The Louisiana Purchase from France roughly doubled U.S. territory." },
      { id:"5ss4", q:"What economic system does the U.S. primarily use?", opts:["Communism","Command economy","Mixed market economy","Traditional economy"], ans:2, teks:"5.11", exp:"The U.S. has a mixed market economy — mostly free market with some regulation." },
      { id:"5ss5", q:"Which amendment abolished slavery?", opts:["1st Amendment","13th Amendment","15th Amendment","19th Amendment"], ans:1, teks:"5.14", exp:"The 13th Amendment (1865) abolished slavery." },
      { id:"5ss6", q:"The Boston Tea Party was a protest against:", opts:["Slavery","British taxation without representation","The Louisiana Purchase","Western expansion"], ans:1, teks:"5.2", exp:"Colonists protested British 'taxation without representation' by dumping tea in Boston Harbor." },
      { id:"5ss7", q:"Who wrote the Emancipation Proclamation?", opts:["George Washington","Thomas Jefferson","Abraham Lincoln","Ulysses S. Grant"], ans:2, teks:"5.6", exp:"President Abraham Lincoln issued the Emancipation Proclamation in 1863." },
      { id:"5ss8", q:"What was the main purpose of the Lewis and Clark Expedition (1804-1806)?", opts:["Start the Civil War","Explore the Louisiana Purchase territory","Fight the British","Map the East Coast"], ans:1, teks:"5.3", exp:"Lewis and Clark explored the newly acquired Louisiana Territory." },
      { id:"5ss9", q:"Which of these describes the concept of 'checks and balances'?", opts:["All power belongs to one branch","Each branch can limit the power of the others","States control the federal government","Citizens vote on all laws"], ans:1, teks:"5.14", exp:"Checks and balances prevent any one branch from having too much power." },
      { id:"5ss10", q:"What was the significance of the Underground Railroad?", opts:["A subway in New York","A secret network helping enslaved people escape to freedom","A trade route for goods","A railroad connecting North and South"], ans:1, teks:"5.6", exp:"The Underground Railroad was a network of safe houses helping enslaved people reach freedom." },
    ],
  },
  "8": {
    math: [
      { id:"8m1", q:"Solve: 3x + 7 = 22", opts:["x=3","x=5","x=7","x=10"], ans:1, teks:"8.8C", exp:"3x = 15 → x = 5." },
      { id:"8m2", q:"State the Pythagorean theorem:", opts:["a+b=c","a²+b²=c²","a×b=c²","a²−b²=c"], ans:1, teks:"8.7C", exp:"a²+b²=c² for right triangles." },
      { id:"8m3", q:"What is the slope of y = 2x + 3?", opts:["3","2","5","1/2"], ans:1, teks:"8.4C", exp:"In y=mx+b, m is slope. Here m=2." },
      { id:"8m4", q:"Scientific notation of 0.000045?", opts:["4.5×10⁻⁵","4.5×10⁵","45×10⁻⁶","0.45×10⁻⁴"], ans:0, teks:"8.2C", exp:"Move decimal 5 places right: 4.5×10⁻⁵." },
      { id:"8m5", q:"Right triangle with legs 6 and 8. Hypotenuse?", opts:["10","12","14","√50"], ans:0, teks:"8.7C", exp:"6²+8²=100. √100=10." },
      { id:"8m6", q:"Solve the system: y=x+2 and y=2x−1.", opts:["(3,5)","(2,4)","(1,3)","(5,3)"], ans:0, teks:"8.9A", exp:"x+2=2x−1 → x=3, y=5." },
      { id:"8m7", q:"If f(x)=3x−4, what is f(5)?", opts:["7","11","19","15"], ans:1, teks:"8.5A", exp:"f(5)=3(5)−4=11." },
      { id:"8m8", q:"Slope of a line through (0,4) and (3,0)?", opts:["4/3","−4/3","3/4","−3/4"], ans:1, teks:"8.4A", exp:"(0−4)/(3−0)=−4/3." },
      { id:"8m9", q:"Which transformation slides a figure without changing size?", opts:["Dilation","Reflection","Rotation","Translation"], ans:3, teks:"8.10A", exp:"Translation = slide to new position." },
      { id:"8m10", q:"Volume of a sphere with radius 3 cm (π≈3.14)?", opts:["28.26 cm³","113.04 cm³","37.68 cm³","56.52 cm³"], ans:1, teks:"8.7A", exp:"V=(4/3)πr³=(4/3)(3.14)(27)=113.04 cm³." },
    ],
    ela: [
      { id:"8e1", q:"What effect does second-person ('you') point of view create?", opts:["Distance from text","Direct engagement with reader","Shows author's feelings","Multiple perspectives"], ans:1, teks:"8.7A", exp:"'You' directly addresses and engages the reader." },
      { id:"8e2", q:"'Textual evidence' means:", opts:["Your opinion about a text","Exact words/details from text supporting a claim","The author's biography","The back-cover summary"], ans:1, teks:"8.6A", exp:"Textual evidence = specific quotes/details from the text." },
      { id:"8e3", q:"The purpose of a 'hook' in an essay:", opts:["State the thesis","List main points","Grab reader's attention","Provide evidence"], ans:2, teks:"8.12A", exp:"A hook draws readers in at the start." },
      { id:"8e4", q:"'Ostracize' means:", opts:["Celebrate someone","Exclude or banish from a group","Praise publicly","Study carefully"], ans:1, teks:"8.3A", exp:"To ostracize = to exclude from a group." },
      { id:"8e5", q:"Evaluating an author's credibility means:", opts:["Checking if writing is long enough","Checking if sources are reliable and author is qualified","Counting facts","Deciding if topic is interesting"], ans:1, teks:"8.10A", exp:"Credibility = author expertise + reliable, unbiased sources." },
      { id:"8e6", q:"What is the purpose of a 'transition' in writing?", opts:["Start a new paragraph","Connect ideas and guide the reader","Introduce characters","End the essay"], ans:1, teks:"8.12A", exp:"Transitions (however, therefore, in addition) connect ideas smoothly." },
      { id:"8e7", q:"Which is an example of 'juxtaposition'?", opts:["Repeating a word for emphasis","Placing contrasting ideas side by side","A comparison using 'like'","Giving human traits to objects"], ans:1, teks:"8.8", exp:"Juxtaposition = placing contrasting ideas together to highlight differences." },
      { id:"8e8", q:"What is 'syntax' in writing?", opts:["Word choice","The arrangement of words and phrases in sentences","The use of sound devices","The overall theme"], ans:1, teks:"8.11A", exp:"Syntax refers to the arrangement/structure of sentences." },
      { id:"8e9", q:"An 'unreliable narrator' is one who:", opts:["Tells the story in first person","Cannot be fully trusted to give accurate information","Knows everything about all characters","Speaks directly to the reader"], ans:1, teks:"8.7A", exp:"An unreliable narrator's account is biased, limited, or dishonest." },
      { id:"8e10", q:"What does 'annotating' a text mean?", opts:["Reading it quickly","Writing notes and highlighting key ideas while reading","Summarizing only the ending","Looking up all unknown words"], ans:1, teks:"8.6A", exp:"Annotation = actively marking and noting ideas as you read." },
    ],
    science: [
      { id:"8sc1", q:"Law of conservation of mass states:", opts:["Mass is created in reactions","Mass is destroyed in reactions","Mass cannot be created or destroyed in chemical reactions","Mass increases when heated"], ans:2, teks:"8.5E", exp:"Reactant mass always equals product mass in chemical reactions." },
      { id:"8sc2", q:"What type of plate boundary causes most Ring of Fire activity?", opts:["Divergent","Convergent","Transform","Fracture"], ans:1, teks:"8.9A", exp:"Convergent boundaries create subduction → earthquakes and volcanoes." },
      { id:"8sc3", q:"Difference between speed and velocity?", opts:["They're identical","Speed = magnitude only; velocity includes direction","Velocity is always faster","Speed includes direction"], ans:1, teks:"8.6A", exp:"Velocity is a vector (speed + direction); speed is scalar." },
      { id:"8sc4", q:"Meiosis from a human cell (46 chromosomes) produces gametes with:", opts:["46","92","23","12"], ans:2, teks:"8.14B", exp:"Meiosis halves chromosomes: 46 ÷ 2 = 23." },
      { id:"8sc5", q:"What happens to light entering water from air?", opts:["Speeds up","Slows down and bends (refracts)","Reflects completely","Color changes permanently"], ans:1, teks:"8.7A", exp:"Light slows in denser media, causing it to bend (refraction)." },
      { id:"8sc6", q:"What is the formula for Newton's Second Law?", opts:["F = mv","F = ma","E = mc²","P = mv"], ans:1, teks:"8.6A", exp:"F = ma: Force equals mass times acceleration." },
      { id:"8sc7", q:"Which type of wave does NOT require a medium?", opts:["Sound waves","Ocean waves","Electromagnetic waves","Seismic waves"], ans:2, teks:"8.7A", exp:"Electromagnetic waves (light, radio) travel through a vacuum." },
      { id:"8sc8", q:"What is 'natural selection'?", opts:["Animals choosing their habitat","Organisms with favorable traits survive and reproduce more","Humans selectively breeding animals","Random mutation only"], ans:1, teks:"8.11A", exp:"Natural selection: better-adapted organisms survive and pass on traits." },
      { id:"8sc9", q:"What is the pH of a neutral substance?", opts:["0","7","14","3"], ans:1, teks:"8.5A", exp:"pH 7 = neutral (like pure water). Below 7 = acidic, above 7 = basic." },
      { id:"8sc10", q:"What is 'potential energy'?", opts:["Energy of motion","Stored energy due to position or condition","Energy from chemical bonds only","Energy released as heat"], ans:1, teks:"8.6B", exp:"Potential energy is stored energy (e.g., a ball held up high)." },
    ],
    social: [
      { id:"8ss1", q:"What triggered World War I?", opts:["Assassination of Archduke Franz Ferdinand","Invasion of Poland","Sinking of the Lusitania","Russian Revolution"], ans:0, teks:"8.2", exp:"The 1914 assassination activated alliance systems, starting WWI." },
      { id:"8ss2", q:"What economic system is based on private ownership and free markets?", opts:["Socialism","Communism","Capitalism","Feudalism"], ans:2, teks:"8.9", exp:"Capitalism = private ownership + free markets + competition." },
      { id:"8ss3", q:"'Imperialism' means:", opts:["Equal trade between nations","A country extending power over other territories","Economic independence","Military defense only"], ans:1, teks:"8.2", exp:"Imperialism = dominating weaker nations politically, economically, or militarily." },
      { id:"8ss4", q:"Purpose of the Marshall Plan after WWII?", opts:["Rebuild Europe and prevent spread of communism","Punish Germany","Create the UN","End the Korean War"], ans:0, teks:"8.3", exp:"The Marshall Plan rebuilt Western Europe and countered communism's appeal." },
      { id:"8ss5", q:"The Cold War was primarily between:", opts:["Britain and France","U.S. and Soviet Union","China and Japan","Germany and Russia"], ans:1, teks:"8.3", exp:"Cold War (1947–1991): capitalist U.S. vs. communist Soviet Union." },
      { id:"8ss6", q:"What was apartheid?", opts:["A tax system in South Africa","A system of racial segregation in South Africa","A form of government in India","A war in Southeast Asia"], ans:1, teks:"8.4", exp:"Apartheid was South Africa's official policy of racial segregation (1948–1994)." },
      { id:"8ss7", q:"What event began the Great Depression in 1929?", opts:["World War I ended","The stock market crashed","A major drought hit the U.S.","The Federal Reserve was created"], ans:1, teks:"8.3", exp:"The 1929 stock market crash (Black Tuesday) triggered the Great Depression." },
      { id:"8ss8", q:"What was the primary goal of the Civil Rights Movement?", opts:["End World War II","Achieve racial equality and end segregation","Gain women's right to vote","Expand westward territory"], ans:1, teks:"8.3", exp:"The Civil Rights Movement fought for racial equality and an end to segregation." },
      { id:"8ss9", q:"What does 'sovereignty' mean?", opts:["Economic power","A nation's authority to govern itself","The right to vote","Military strength"], ans:1, teks:"8.22", exp:"Sovereignty = a government's full authority to rule without outside control." },
      { id:"8ss10", q:"What was the purpose of the GI Bill (1944)?", opts:["Fund WWII military operations","Help veterans with education, housing, and jobs after WWII","Create the United Nations","End the Korean War"], ans:1, teks:"8.3", exp:"The GI Bill provided education, housing, and job benefits to returning WWII veterans." },
    ],
  },
};

function getQs(grade, subject, count = 10) {
  const gradeData = QB[grade] || QB["5"];
  const sData = (gradeData && gradeData[subject]) || gradeData?.math || QB["5"].math;
  const arr = [...sData];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(count, arr.length));
}

// ── Constants ──────────────────────────────────────────────────────────────

const GRADES = [
  {id:"K",label:"Kindergarten"},{id:"1",label:"1st Grade"},{id:"2",label:"2nd Grade"},
  {id:"3",label:"3rd Grade"},{id:"4",label:"4th Grade"},{id:"5",label:"5th Grade"},
  {id:"6",label:"6th Grade"},{id:"7",label:"7th Grade"},{id:"8",label:"8th Grade"},
  {id:"9",label:"9th Grade"},{id:"10",label:"10th Grade"},{id:"11",label:"11th Grade"},{id:"12",label:"12th Grade"},
];
const SUBJECTS = [
  {id:"math",label:"Mathematics",icon:"➕",bg:"#dbeafe",accent:"#1d4ed8"},
  {id:"ela",label:"Reading & ELA",icon:"📖",bg:"#d1fae5",accent:"#065f46"},
  {id:"science",label:"Science",icon:"🔬",bg:"#fce7f3",accent:"#9d174d"},
  {id:"social",label:"Social Studies",icon:"🌎",bg:"#fef3c7",accent:"#92400e"},
];
const MODES = [
  {id:"practice",label:"Daily Practice",icon:"✏️",desc:"TEKS-aligned questions",color:"#4f46e5"},
  {id:"staar",label:"STAAR Prep",icon:"⭐",desc:"Test-style questions",color:"#e11d48"},
  {id:"map",label:"MAP Prep",icon:"📊",desc:"Growth skill building",color:"#0891b2"},
  {id:"gt",label:"Gifted & Talented",icon:"🏆",desc:"Advanced challenges",color:"#7c3aed"},
];

// Official STAAR test lengths from TEA / ESC Region 13 blueprints (2024-26).
// STAAR is statewide — identical in every ISD. High school grades map to EOC tests
// (Algebra I, English I/II, Biology, U.S. History). Update here if TEA revises blueprints.
const STAAR_LEN = {
  math:    { "3":30, "4":32, "5":34, "6":36, "7":38, "8":40, "9":45, "10":45, "11":45, "12":45 },
  ela:     { "3":39, "4":40, "5":41, "6":41, "7":42, "8":43, "9":47, "10":47, "11":47, "12":47 },
  science: { "5":32, "8":38, "9":45, "10":45, "11":45, "12":45 },
  social:  { "8":44, "9":64, "10":64, "11":64, "12":64 },
};
function officialLen(grade, subject, mode, state) {
  if (mode === "map") return 40; // NWEA MAP Growth sessions run ~40 questions (nationwide)
  if (mode === "staar") {
    if (!state || state === "TX") return (STAAR_LEN[subject] || {})[grade] || null;
    // Other states: federal law tests math + reading in grades 3-8 & once in HS; science in ~2 grades.
    const g = parseInt(grade, 10);
    if ((subject === "math" || subject === "ela") && ((g >= 3 && g <= 8) || ["9","10","11"].includes(grade))) return 40;
    if (subject === "science" && (grade === "5" || grade === "8" || grade === "11")) return 40;
    return null;
  }
  return null;
}

// ── Text-to-Speech ─────────────────────────────────────────────────────────

function speak(text, onEnd) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.9; utt.pitch = 1.05; utt.volume = 1;
  if (onEnd) utt.onend = onEnd;
  window.speechSynthesis.speak(utt);
}
function stopSpeech() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

// ── Shared Styles ──────────────────────────────────────────────────────────

const S = {
  page: {minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)",fontFamily:"'Nunito',system-ui,sans-serif",color:"#f1f5f9",overflowX:"hidden"},
  card: {background:"rgba(255,255,255,0.05)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"24px 28px"},
  btn: {cursor:"pointer",border:"none",borderRadius:14,fontFamily:"inherit",fontWeight:700,transition:"all 0.18s ease",fontSize:15},
  primaryBtn: {background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",padding:"14px 32px",fontSize:16,borderRadius:14,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700,boxShadow:"0 4px 24px rgba(99,102,241,0.4)",transition:"all 0.18s ease"},
};

// ── Screens ────────────────────────────────────────────────────────────────

// SCREEN 1: Welcome / Location
function WelcomeScreen({ onNext, user, onAuth, onHistory, onSignOut, onAdmin }) {
  const [logoTaps, setLogoTaps] = useState(0);
  const handleLogoTap = () => {
    const n = logoTaps + 1;
    setLogoTaps(n);
    if (n >= 5) { setLogoTaps(0); onAdmin && onAdmin(); }
  };
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [touched, setTouched] = useState(false);
  const [stateCode, setStateCode] = useState("TX");

  useEffect(() => {
    let alive = true;
    (async () => {
      if (query.length < 2) { setResults([]); return; }
      const sb = getSupabase();
      if (sb) {
        try {
          let req = sb.from("districts").select("name,city,state").eq("state", stateCode).limit(8);
          const zq = query.trim();
          if (/^\d{3,5}$/.test(zq)) req = req.contains("zips", [zq]);
          else req = req.or(`name.ilike.%${zq}%,city.ilike.%${zq}%`);
          const { data } = await req;
          if (alive && data && data.length) {
            setResults(data.map((d, i) => ({ id: `${d.state}-${i}-${d.name}`, name: d.name, city: d.city, state: d.state })));
            return;
          }
        } catch (e) { /* fall through to bundled data */ }
      }
      if (alive) setResults(stateCode === "TX" ? searchISD(query) : []);
    })();
    return () => { alive = false; };
  }, [query, stateCode]);

  return (
    <div style={{...S.page,position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 16px",minHeight:"100vh"}}>
      {/* Account bar */}
      <div style={{position:"absolute",top:14,right:14,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
        {getSupabase() && (user ? (
          <>
            <span style={{fontSize:12,color:"#94a3b8",fontWeight:700}}>👋 {user.user_metadata?.display_name || user.email?.split("@")[0]}</span>
            <button onClick={onHistory} style={{...S.btn,background:"rgba(99,102,241,0.2)",border:"1px solid rgba(99,102,241,0.4)",color:"#a78bfa",padding:"7px 14px",fontSize:12}}>📜 My History</button>
            <button onClick={onSignOut} style={{...S.btn,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",color:"#64748b",padding:"7px 12px",fontSize:12}}>Sign Out</button>
          </>
        ) : (
          <button onClick={onAuth} style={{...S.btn,background:"rgba(99,102,241,0.2)",border:"1px solid rgba(99,102,241,0.4)",color:"#a78bfa",padding:"8px 16px",fontSize:13}}>🔐 Sign In / Sign Up</button>
        ))}
      </div>
      {/* Logo */}
      <div style={{textAlign:"center",marginBottom:36}}>
        <div onClick={handleLogoTap} style={{width:88,height:88,margin:"0 auto 14px",borderRadius:26,background:"linear-gradient(135deg,#6366f1 0%,#a855f7 55%,#ec4899 100%)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 10px 36px rgba(139,92,246,0.45)",cursor:"default",userSelect:"none"}}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M12 2l2.9 6.26 6.6 1.01-5 4.87 1.18 6.88L12 17.77l-5.68 3.25L7.5 14.14l-5-4.87 6.6-1.01L12 2z"/></svg>
        </div>
        <h1 style={{margin:0,fontSize:42,fontWeight:900,letterSpacing:-1,background:"linear-gradient(135deg,#a78bfa,#60a5fa,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>TexPrep</h1>
        <p style={{margin:"8px 0 0",color:"#94a3b8",fontSize:17,fontWeight:600}}>Texas K–12 Practice · TEKS-Aligned</p>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12,flexWrap:"wrap"}}>
          {["TEKS-Aligned","STAAR Prep","MAP Prep","G&T Mode"].map(t=>(
            <span key={t} style={{background:"rgba(99,102,241,0.2)",border:"1px solid rgba(99,102,241,0.4)",borderRadius:20,padding:"4px 12px",fontSize:12,color:"#a78bfa",fontWeight:700}}>{t}</span>
          ))}
        </div>
      </div>

      {/* ISD Search Card */}
      <div style={{...S.card,width:"100%",maxWidth:460}}>
        <h2 style={{margin:"0 0 6px",fontSize:20,fontWeight:800,color:"#f1f5f9"}}>Find Your School District</h2>
        <p style={{margin:"0 0 14px",color:"#94a3b8",fontSize:14}}>Pick your state, then search by city, district name, or ZIP</p>
        <select value={stateCode} onChange={e=>{setStateCode(e.target.value);setSelected(null);setResults([]);}}
          style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1.5px solid rgba(255,255,255,0.15)",borderRadius:12,padding:"12px 14px",color:"#f1f5f9",fontSize:14,fontFamily:"inherit",boxSizing:"border-box",outline:"none",marginBottom:10,appearance:"auto"}}>
          {LIVE_STATE_OPTIONS.map(([code,name])=>(<option key={code} value={code} style={{background:"#1e1b4b",color:"#f1f5f9"}}>{name}</option>))}
        </select>

        <div style={{position:"relative"}}>
          <div style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:20}}>🔍</div>
          <input
            value={query}
            onChange={e=>{setQuery(e.target.value);setSelected(null);setTouched(true);}}
            placeholder="e.g. Houston or 77001 or Frisco..."
            style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1.5px solid rgba(255,255,255,0.15)",borderRadius:12,padding:"14px 14px 14px 44px",color:"#f1f5f9",fontSize:15,fontFamily:"inherit",boxSizing:"border-box",outline:"none"}}
          />
        </div>

        {results.length > 0 && !selected && (
          <div style={{marginTop:8,background:"rgba(15,23,42,0.9)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,overflow:"hidden",maxHeight:260,overflowY:"auto"}}>
            {results.map(isd=>(
              <div key={isd.id} onClick={()=>{setSelected(isd);setResults([]);setQuery(isd.name);}}
                style={{padding:"12px 16px",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.06)",transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(99,102,241,0.2)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{fontWeight:700,fontSize:14,color:"#f1f5f9"}}>{isd.name}</div>
                <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{isd.city ? isd.city + ", " : ""}{stateName(isd.state || "TX")}</div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div style={{marginTop:12,background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.4)",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:28}}>🏫</span>
            <div>
              <div style={{fontWeight:800,fontSize:15,color:"#c4b5fd"}}>{selected.name}</div>
              <div style={{fontSize:12,color:"#94a3b8"}}>{selected.city ? selected.city + ", " : ""}{stateName(selected.state || "TX")}</div>
            </div>
            <span style={{marginLeft:"auto",fontSize:20}}>✅</span>
          </div>
        )}

        {touched && results.length === 0 && !selected && query.length >= 3 && (
          <p style={{color:"#fb7185",fontSize:13,margin:"10px 0 0"}}>No ISDs found. Try a different city or ZIP code.</p>
        )}

        <button
          onClick={()=>selected && onNext({...selected, state: selected.state || stateCode})}
          style={{...S.primaryBtn,width:"100%",marginTop:20,opacity:selected?1:0.4,cursor:selected?"pointer":"not-allowed"}}>
          Continue to Grade Selection →
        </button>

        <p style={{textAlign:"center",color:"#475569",fontSize:12,margin:"14px 0 0"}}>
          Texas school districts · NCES public data
        </p>
      </div>

      {/* Donate + Feedback links */}
      <div style={{display:"flex",gap:12,marginTop:20,flexWrap:"wrap",justifyContent:"center"}}>
        <a href={DONATE_URL} target="_blank" rel="noopener noreferrer"
          style={{...S.btn,background:"rgba(236,72,153,0.15)",border:"1px solid rgba(236,72,153,0.4)",color:"#f9a8d4",padding:"10px 20px",fontSize:13,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6}}>
          ❤️ Support TexPrep
        </a>
        <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer"
          style={{...S.btn,background:"rgba(96,165,250,0.15)",border:"1px solid rgba(96,165,250,0.4)",color:"#93c5fd",padding:"10px 20px",fontSize:13,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6}}>
          💬 Feedback
        </a>
      </div>
      <p style={{textAlign:"center",color:"#475569",fontSize:11,margin:"14px 0 0",maxWidth:420,lineHeight:1.5}}>
        TexPrep is free while we build. Donations are entirely optional and help keep it running.
      </p>
    </div>
  );
}

// SCREEN 2: Grade + Subject + Mode
function SetupScreen({ isd, onStart, onBack }) {
  const [grade, setGrade] = useState(null);
  const [subject, setSubject] = useState(null);
  const [mode, setMode] = useState(null);
  const [count, setCount] = useState(10);

  const ready = grade && subject && mode;

  return (
    <div style={{...S.page,padding:"20px 16px",minHeight:"100vh"}}>
      <div style={{maxWidth:580,margin:"0 auto"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
          <button onClick={onBack} style={{...S.btn,background:"rgba(255,255,255,0.08)",color:"#94a3b8",padding:"8px 16px",fontSize:13}}>← Back</button>
          <div>
            <div style={{fontWeight:800,fontSize:18,color:"#f1f5f9"}}>🏫 {isd.name}</div>
            <div style={{fontSize:12,color:"#64748b"}}>{isd.city ? isd.city + ", " : ""}{stateName(isd.state || "TX")}</div>
          </div>
        </div>

        {/* Grade */}
        <div style={{...S.card,marginBottom:16}}>
          <h3 style={{margin:"0 0 14px",fontSize:15,fontWeight:800,color:"#a78bfa",textTransform:"uppercase",letterSpacing:1}}>Select Your Grade</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:8}}>
            {GRADES.map(g=>(
              <button key={g.id} onClick={()=>setGrade(g.id)}
                style={{...S.btn,padding:"10px 4px",fontSize:13,background:grade===g.id?"linear-gradient(135deg,#6366f1,#8b5cf6)":"rgba(255,255,255,0.06)",color:grade===g.id?"#fff":"#94a3b8",border:grade===g.id?"none":"1px solid rgba(255,255,255,0.08)",transform:grade===g.id?"scale(1.05)":"scale(1)"}}>
                {g.label.replace(" Grade","").replace("Kindergarten","Kinder")}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div style={{...S.card,marginBottom:16}}>
          <h3 style={{margin:"0 0 14px",fontSize:15,fontWeight:800,color:"#34d399",textTransform:"uppercase",letterSpacing:1}}>Choose a Subject</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {SUBJECTS.map(s=>(
              <button key={s.id} onClick={()=>setSubject(s.id)}
                style={{...S.btn,padding:"14px 10px",background:subject===s.id?s.accent:"rgba(255,255,255,0.05)",color:subject===s.id?"#fff":"#cbd5e1",border:subject===s.id?"none":"1px solid rgba(255,255,255,0.08)",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transform:subject===s.id?"scale(1.03)":"scale(1)"}}>
                <span style={{fontSize:26}}>{s.icon}</span>
                <span style={{fontSize:12,fontWeight:700}}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <div style={{...S.card,marginBottom:16}}>
          <h3 style={{margin:"0 0 14px",fontSize:15,fontWeight:800,color:"#60a5fa",textTransform:"uppercase",letterSpacing:1}}>Practice Mode</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {MODES.map(m=>{
              const st = isd?.state || "TX";
              const label = m.id === "staar" ? `${stateTestName(st)} Prep` : m.label;
              const desc = m.id === "staar" ? `${stateName(st)} state test practice`
                : m.id === "practice" ? (st === "TX" ? "TEKS-aligned questions" : "Standards-aligned questions")
                : m.desc;
              return (
              <button key={m.id} onClick={()=>setMode(m.id)}
                style={{...S.btn,padding:"12px 10px",background:mode===m.id?m.color:"rgba(255,255,255,0.05)",color:mode===m.id?"#fff":"#94a3b8",border:mode===m.id?"none":"1px solid rgba(255,255,255,0.08)",textAlign:"left",transform:mode===m.id?"scale(1.02)":"scale(1)"}}>
                <div style={{fontSize:20,marginBottom:4}}>{m.icon}</div>
                <div style={{fontSize:13,fontWeight:800}}>{label}</div>
                <div style={{fontSize:11,opacity:0.8,marginTop:2}}>{desc}</div>
              </button>
            );})}
          </div>
        </div>

        {/* Question Count */}
        <div style={{...S.card,marginBottom:20}}>
          <h3 style={{margin:"0 0 12px",fontSize:15,fontWeight:800,color:"#fbbf24",textTransform:"uppercase",letterSpacing:1}}>Number of Questions</h3>
          {(() => { const n = grade && subject && mode ? officialLen(grade, subject, mode, isd?.state) : null; return n ? (
            <button onClick={()=>setCount(n)}
              style={{...S.btn,width:"100%",marginBottom:10,padding:"14px 8px",fontSize:15,background:count===n?"linear-gradient(135deg,#e11d48,#be123c)":"rgba(225,29,72,0.12)",color:count===n?"#fff":"#fda4af",border:count===n?"none":"1.5px solid rgba(225,29,72,0.45)"}}>
              🎯 Official Test Length — {n} Questions {count===n?"✓":""}
            </button>
          ) : null; })()}
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[5,10,15,20,30].map(n=>(
              <button key={n} onClick={()=>setCount(n)}
                style={{...S.btn,flex:1,minWidth:86,padding:"12px 4px",fontSize:15,background:count===n?"linear-gradient(135deg,#f59e0b,#d97706)":"rgba(255,255,255,0.06)",color:count===n?"#fff":"#94a3b8",border:count===n?"none":"1px solid rgba(255,255,255,0.08)"}}>
                {n} Qs
              </button>
            ))}
          </div>
          <p style={{margin:"10px 0 0",fontSize:12,color:"#64748b"}}>💡 "Official Test Length" matches the real state test blueprint for your grade & subject — the most authentic practice experience.</p>
        </div>

        <button
          onClick={()=>ready && onStart({grade,subject,mode,count})}
          style={{...S.primaryBtn,width:"100%",fontSize:18,padding:"18px",opacity:ready?1:0.4,cursor:ready?"pointer":"not-allowed"}}>
          🚀 Start Practice Session
        </button>
      </div>
    </div>
  );
}

// SCREEN 3: Practice Sheet
function PracticeScreen({ isd, config, onFinish, onBack }) {
  const { grade, subject, mode, count } = config;
  const [questions, setQuestions] = useState(null);
  const [short, setShort] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const sb = getSupabase();
      const st = (isd && isd.state) || "TX";
      if (sb) {
        try {
          let { data } = await sb.from("question_bank").select("q,opts,ans,teks,exp")
            .eq("grade", grade).eq("subject", subject).eq("mode", mode).eq("state", st).limit(400);
          let pool = data || [];
          if (pool.length < count) {
            const r2 = await sb.from("question_bank").select("q,opts,ans,teks,exp")
              .eq("grade", grade).eq("subject", subject).eq("state", st).limit(400);
            // merge + dedupe by question text
            const seen = new Set(pool.map((x) => x.q));
            for (const row of (r2.data || [])) { if (!seen.has(row.q)) { pool.push(row); seen.add(row.q); } }
          }
          if (alive && pool.length > 0) {
            const arr = [...pool];
            for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
            const served = arr.slice(0, count);
            if (served.length < count) setShort(count - served.length);
            setQuestions(served);
            return;
          }
        } catch (e) { /* fall through */ }
      }
      // Fallback: bundled questions exist for Texas only. Other states with an empty
      // bank show a friendly "content coming soon" state instead of wrong-state content.
      if (alive) {
        if (st === "TX") setQuestions(getQs(grade, subject, count));
        else setQuestions([]);
      }
    })();
    return () => { alive = false; };
  }, []);
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [showExp, setShowExp] = useState(false);
  const timerRef = useRef(null);

  const subj = SUBJECTS.find(s=>s.id===subject);
  const modeInfo = MODES.find(m=>m.id===mode);
  const q = questions ? questions[qi] : null;

  useEffect(()=>{
    if (!questions) return;
    timerRef.current = setInterval(()=>setElapsed(e=>e+1),1000);
    return ()=>clearInterval(timerRef.current);
  },[questions]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const handleSpeak = useCallback(()=>{
    if (speaking) { stopSpeech(); setSpeaking(false); return; }
    setSpeaking(true);
    const text = `Question ${qi+1}. ${q.q}. Option A: ${q.opts[0]}. Option B: ${q.opts[1]}. Option C: ${q.opts[2]}. Option D: ${q.opts[3]}.`;
    speak(text, ()=>setSpeaking(false));
  },[speaking,qi,q]);

  const handleSelect = useCallback((idx)=>{
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    setShowExp(false);
  },[answered]);

  const handleNext = useCallback(()=>{
    stopSpeech(); setSpeaking(false);
    const newAnswers = [...answers, { q: q.q, selected, correct: q.ans, teks: q.teks, opts: q.opts, exp: q.exp }];
    setAnswers(newAnswers);
    if (qi + 1 >= questions.length) {
      clearInterval(timerRef.current);
      onFinish({ answers: newAnswers, elapsed, questions, config });
    } else {
      setQi(qi+1); setSelected(null); setAnswered(false); setShowExp(false);
    }
  },[answers,q,selected,qi,questions,elapsed,config,onFinish]);

  if (!questions) return (
    <div style={{...S.page,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:16}}>
      <div style={{fontSize:54}}>📚</div>
      <p style={{color:"#a78bfa",fontWeight:800,fontSize:17,margin:0}}>Building your practice sheet...</p>
      <p style={{color:"#64748b",fontSize:13,margin:0}}>{subj?.label} · Grade {grade} · {modeInfo?.label}</p>
    </div>
  );
  if (questions.length === 0) return (
    <div style={{...S.page,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:14,padding:"20px 24px",textAlign:"center"}}>
      <div style={{fontSize:56}}>🚧</div>
      <p style={{color:"#f1f5f9",fontWeight:800,fontSize:19,margin:0}}>Questions coming soon!</p>
      <p style={{color:"#94a3b8",fontSize:14,margin:0,maxWidth:340,lineHeight:1.6}}>
        We're still building the {stateName(isd?.state||"TX")} question bank for {subj?.label}, Grade {grade}. Fresh questions are added every day — please check back soon, or try another subject or grade.
      </p>
      <button onClick={onBack} style={{...S.btn,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",padding:"13px 28px",fontSize:15,marginTop:8}}>← Choose Another</button>
    </div>
  );
  if (!q) return null;
  const progress = (qi / questions.length) * 100;

  return (
    <div style={{...S.page,padding:"16px",minHeight:"100vh"}}>
      <div style={{maxWidth:640,margin:"0 auto"}}>
        {/* Top bar */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
          <button onClick={()=>{stopSpeech();onBack();}} style={{...S.btn,background:"rgba(255,255,255,0.08)",color:"#94a3b8",padding:"8px 14px",fontSize:12}}>✕ Exit</button>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{background:"rgba(99,102,241,0.2)",border:"1px solid rgba(99,102,241,0.4)",borderRadius:20,padding:"6px 14px",fontSize:13,fontWeight:700,color:"#a78bfa"}}>{subj?.icon} {subj?.label}</span>
            <span style={{background:"rgba(99,102,241,0.2)",border:"1px solid rgba(99,102,241,0.4)",borderRadius:20,padding:"6px 14px",fontSize:13,fontWeight:700,color:"#a78bfa"}}>{modeInfo?.icon} {mode==="staar"?`${stateTestName(isd?.state||"TX")} Prep`:modeInfo?.label}</span>
          </div>
          <div style={{background:"rgba(15,23,42,0.8)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"6px 16px",fontFamily:"'Courier New',monospace",fontSize:18,fontWeight:900,color:"#34d399",letterSpacing:2}}>⏱ {fmt(elapsed)}</div>
        </div>

        {/* Progress bar */}
        <div style={{background:"rgba(255,255,255,0.08)",borderRadius:8,height:8,marginBottom:20,overflow:"hidden"}}>
          <div style={{height:"100%",background:"linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899)",borderRadius:8,width:`${progress}%`,transition:"width 0.4s ease"}}/>
        </div>
        <div style={{textAlign:"center",fontSize:13,color:"#64748b",marginBottom:20}}>Question {qi+1} of {questions.length}{short>0?` · more being added soon`:""}</div>

        {/* Question Card */}
        <div style={{...S.card,marginBottom:16}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:"#64748b",background:"rgba(255,255,255,0.05)",padding:"4px 10px",borderRadius:20,border:"1px solid rgba(255,255,255,0.08)"}}>{q.teks}</div>
            <button onClick={handleSpeak}
              style={{...S.btn,background:speaking?"rgba(52,211,153,0.2)":"rgba(255,255,255,0.08)",color:speaking?"#34d399":"#94a3b8",padding:"8px 14px",fontSize:12,border:speaking?"1px solid rgba(52,211,153,0.4)":"1px solid rgba(255,255,255,0.1)",whiteSpace:"nowrap",flexShrink:0}}>
              {speaking?"🔊 Stop":"🔈 Read Aloud"}
            </button>
          </div>
          <p style={{fontSize:19,fontWeight:700,lineHeight:1.5,color:"#f1f5f9",margin:0}}>{q.q}</p>
        </div>

        {/* Options */}
        <div style={{display:"grid",gridTemplateColumns:"1fr",gap:10,marginBottom:16}}>
          {q.opts.map((opt,i)=>{
            let bg="rgba(255,255,255,0.05)",border="1px solid rgba(255,255,255,0.1)",color="#cbd5e1",icon="";
            if (answered) {
              if (i===q.ans) { bg="rgba(52,211,153,0.15)"; border="2px solid #34d399"; color="#34d399"; icon="✅"; }
              else if (i===selected && i!==q.ans) { bg="rgba(251,113,133,0.15)"; border="2px solid #fb7185"; color="#fb7185"; icon="❌"; }
            } else if (selected===i) { bg="rgba(99,102,241,0.2)"; border="2px solid #6366f1"; color="#a78bfa"; }
            return (
              <button key={i} onClick={()=>handleSelect(i)}
                style={{...S.btn,padding:"14px 18px",background:bg,border,color,textAlign:"left",display:"flex",alignItems:"center",gap:10,transform:answered?"scale(1)":"scale(1)",cursor:answered?"default":"pointer"}}>
                <span style={{fontSize:14,fontWeight:900,opacity:0.6,minWidth:20}}>{"ABCD"[i]}.</span>
                <span style={{fontSize:15,fontWeight:600}}>{opt}</span>
                {icon && <span style={{marginLeft:"auto",fontSize:18}}>{icon}</span>}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div style={{marginBottom:16}}>
            <button onClick={()=>setShowExp(v=>!v)}
              style={{...S.btn,background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.3)",color:"#fbbf24",padding:"10px 18px",fontSize:13,width:"100%"}}>
              {showExp?"▲ Hide Explanation":"💡 Show Explanation"}
            </button>
            {showExp && (
              <div style={{marginTop:8,background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:12,padding:"14px 16px"}}>
                <p style={{margin:0,color:"#fde68a",fontSize:14,lineHeight:1.6}}><strong>Explanation:</strong> {q.exp}</p>
              </div>
            )}
          </div>
        )}

        {answered && (
          <button onClick={handleNext} style={{...S.primaryBtn,width:"100%",fontSize:17,padding:"16px"}}>
            {qi+1 >= questions.length ? "📊 See My Results →" : "Next Question →"}
          </button>
        )}
      </div>
    </div>
  );
}

// SCREEN 4: Results
function ResultsScreen({ result, isd, onRestart, onNewSession }) {
  const { answers, elapsed, questions, config } = result;
  const correct = answers.filter(a=>a.selected===a.correct).length;
  const total = answers.length;
  const pct = Math.round((correct/total)*100);
  const mins = Math.floor(elapsed/60), secs = elapsed%60;
  const avgSec = Math.round(elapsed/total);

  const subj = SUBJECTS.find(s=>s.id===config.subject);
  const modeInfo = MODES.find(m=>m.id===config.mode);

  let grade="", gradeColor="", emoji="";
  if (pct>=90){grade="A";gradeColor="#34d399";emoji="🏆";}
  else if (pct>=80){grade="B";gradeColor="#60a5fa";emoji="🌟";}
  else if (pct>=70){grade="C";gradeColor="#fbbf24";emoji="👍";}
  else if (pct>=60){grade="D";gradeColor="#fb923c";emoji="📚";}
  else {grade="F";gradeColor="#fb7185";emoji="💪";}

  return (
    <div style={{...S.page,padding:"16px",minHeight:"100vh"}}>
      <div style={{maxWidth:560,margin:"0 auto"}}>
        {/* Hero */}
        <div style={{textAlign:"center",padding:"32px 20px 24px"}}>
          <div style={{fontSize:80,marginBottom:8}}>{emoji}</div>
          <h1 style={{margin:"0 0 4px",fontSize:56,fontWeight:900,color:gradeColor}}>{grade}</h1>
          <p style={{margin:0,fontSize:20,color:"#94a3b8",fontWeight:700}}>{correct} / {total} correct</p>
          <div style={{fontSize:36,fontWeight:900,color:gradeColor,margin:"8px 0"}}>{pct}%</div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
          {[
            {label:"Time",val:`${mins}m ${secs}s`,icon:"⏱"},
            {label:"Avg/Question",val:`${avgSec}s`,icon:"🎯"},
            {label:"Subject",val:subj?.label,icon:subj?.icon},
          ].map(s=>(
            <div key={s.label} style={{...S.card,textAlign:"center",padding:"16px 8px"}}>
              <div style={{fontSize:24,marginBottom:4}}>{s.icon}</div>
              <div style={{fontSize:13,fontWeight:900,color:"#f1f5f9"}}>{s.val}</div>
              <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Answer review */}
        <div style={{...S.card,marginBottom:20}}>
          <h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1}}>Question Review</h3>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {answers.map((a,i)=>{
              const isRight = a.selected===a.correct;
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:isRight?"rgba(52,211,153,0.08)":"rgba(251,113,133,0.08)",borderRadius:10,border:`1px solid ${isRight?"rgba(52,211,153,0.2)":"rgba(251,113,133,0.2)"}`}}>
                  <span style={{fontSize:18}}>{isRight?"✅":"❌"}</span>
                  <span style={{fontSize:12,color:"#94a3b8",flex:1,lineClamp:1,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{a.q.slice(0,60)}{a.q.length>60?"…":""}</span>
                  <span style={{fontSize:11,fontWeight:700,color:"#64748b",flexShrink:0}}>{a.teks}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivational message */}
        <div style={{...S.card,marginBottom:20,textAlign:"center",background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.3)"}}>
          <p style={{margin:0,fontSize:15,color:"#c4b5fd",fontWeight:600,lineHeight:1.6}}>
            {pct>=90?"Outstanding! You're mastering this material. 🌟":
             pct>=70?"Great work! Review the questions you missed and try again. 📚":
             "Keep practicing! Every session makes you stronger. 💪"}
          </p>
          <p style={{margin:"8px 0 0",fontSize:13,color:"#64748b"}}>
            {isd.name} · Grade {config.grade} · {modeInfo?.label}
          </p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <button onClick={onRestart} style={{...S.btn,background:"rgba(255,255,255,0.08)",color:"#94a3b8",padding:"16px",border:"1px solid rgba(255,255,255,0.1)",fontSize:15}}>🔄 Retry</button>
          <button onClick={onNewSession} style={{...S.primaryBtn,padding:"16px",fontSize:15}}>🆕 New Session</button>
        </div>
      </div>
    </div>
  );
}

// ── App Router ─────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [isd, setIsd] = useState(null);
  const [config, setConfig] = useState(null);
  const [result, setResult] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // Track Supabase auth session
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setAuthLoading(false); return; }
    sb.auth.getSession().then(({ data }) => { setUser(data.session?.user || null); setAuthLoading(false); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setUser(session?.user || null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    setUser(null);
    setScreen("welcome");
  };

  // While checking the session, show a brief splash (prevents auth-screen flash)
  if (authLoading) return (
    <div style={{...S.page,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:14}}>
      <div style={{width:72,height:72,borderRadius:20,background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="42" height="42" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M12 2l2.9 6.26 6.6 1.01-5 4.87 1.18 6.88L12 17.77l-5.68 3.25L7.5 14.14l-5-4.87 6.6-1.01L12 2z"/></svg>
      </div>
      <p style={{color:"#a78bfa",fontWeight:800,fontSize:16,margin:0}}>TexPrep</p>
    </div>
  );

  // LOGIN REQUIRED: if not signed in, the only screens available are auth + forgot.
  if (!user) {
    if (screen === "forgot") return <ForgotScreen onBack={()=>setScreen("auth")}/>;
    return <AuthScreen onDone={u=>{setUser(u);setScreen("welcome");}} onBack={()=>setScreen("auth")} onForgot={()=>setScreen("forgot")} gate />;
  }

  // Signed-in experience
  if (screen === "admin") return <AdminPanel onBack={()=>setScreen("welcome")} />;
  if (screen === "welcome") return <WelcomeScreen user={user} onAuth={()=>setScreen("auth")} onHistory={()=>setScreen("history")} onSignOut={signOut} onAdmin={()=>setScreen("admin")} onNext={isd=>{setIsd(isd);setScreen("setup");}}/>;
  if (screen === "history") return <HistoryScreen user={user} onBack={()=>setScreen("welcome")}/>;
  if (screen === "setup") return <SetupScreen isd={isd} onStart={cfg=>{setConfig(cfg);setScreen("practice");}} onBack={()=>setScreen("welcome")}/>;
  if (screen === "practice") return <PracticeScreen isd={isd} config={config} onFinish={res=>{setResult(res);setScreen("results");saveSession(user,res,isd);}} onBack={()=>setScreen("setup")}/>;
  if (screen === "results") return <ResultsScreen result={result} isd={isd} onRestart={()=>setScreen("practice")} onNewSession={()=>setScreen("setup")}/>;
  return null;
}
