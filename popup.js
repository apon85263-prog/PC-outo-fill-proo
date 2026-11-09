const $=id=>document.getElementById(id);
let extracted={};
$("extract").addEventListener("click", async ()=>{
 const file=$("file").files[0];
 if(!file){$("status").textContent="Please choose a passport PDF/JPG/PNG.";return;}
 $("status").textContent="Reading file locally...";
 try{
  let text="";
  if(file.type==="application/pdf"||file.name.toLowerCase().endsWith(".pdf")){
   text=await extractPdfText(file);
  }else{
   $("status").textContent="Image OCR is not bundled in this version.";
  }
  extracted=parsePassportText(text); render(extracted);
  $("status").textContent="Done. Please verify the extracted information.";
 }catch(e){$("status").textContent="Could not read this file: "+e.message;}
});
$("fill").addEventListener("click",async()=>{
 const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
 if(tab?.id) await chrome.tabs.sendMessage(tab.id,{type:"fill",data:extracted});
});
function render(d){
 const keys=["name","passportNumber","dateOfBirth","nationality","fatherName","motherName","address"];
 $("results").innerHTML=keys.map(k=>`<div class="card row"><div class="key">${label(k)}</div><div class="val">${escapeHtml(d[k]||"Not found")}</div></div>`).join("");
}
function label(k){return ({name:"Name",passportNumber:"Passport No.",dateOfBirth:"Date of Birth",nationality:"Nationality",fatherName:"Father",motherName:"Mother",address:"Address"})[k]||k}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function parsePassportText(t){
 const lines=t.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 const pick=(re)=>{const l=lines.find(x=>re.test(x));if(!l)return "";const m=l.match(/[:\-]\s*(.+)$/);return m?m[1].trim():l.replace(re,"").trim()};
 const d={}; d.passportNumber=pick(/passport\s*(no|number)/i); d.name=pick(/^name\b/i);
 d.dateOfBirth=pick(/date\s*of\s*birth|dob/i); d.nationality=pick(/nationality/i);
 d.fatherName=pick(/father/i); d.motherName=pick(/mother/i); d.address=pick(/address/i);
 if(!d.passportNumber){const m=t.match(/\b[A-Z][0-9]{7,9}\b/);if(m)d.passportNumber=m[0];}
 return d;
}