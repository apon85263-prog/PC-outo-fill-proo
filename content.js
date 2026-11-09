chrome.runtime.onMessage.addListener((msg)=>{
 if(msg.type!=="fill")return; const d=msg.data||{};
 const aliases={name:["name","full name","applicant name"],passportNumber:["passport","passport no","passport number","passport_no"],dateOfBirth:["date of birth","dob","birth date"],nationality:["nationality"],fatherName:["father","father name"],motherName:["mother","mother name"],address:["address","present address","permanent address"]};
 for(const [key,words] of Object.entries(aliases)){if(!d[key])continue;const el=findField(words);if(el){setValue(el,d[key]);el.dispatchEvent(new Event("change",{bubbles:true}));}}
});
function norm(s){return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
function findField(words){
 return [...document.querySelectorAll("input,textarea,select")].find(el=>{
  const hay=norm([el.name,el.id,el.placeholder,el.getAttribute("aria-label"),el.labels?.[0]?.innerText].join(" "));
  return words.some(w=>hay.includes(norm(w)));
 });
}
function setValue(el,v){const setter=Object.getOwnPropertyDescriptor(el.constructor.prototype,"value")?.set;if(setter)setter.call(el,v);else el.value=v;}