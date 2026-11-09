async function extractPdfText(file){
 const buf=await file.arrayBuffer(); const raw=new TextDecoder("latin1").decode(new Uint8Array(buf));
 const streams=[...raw.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)].map(m=>m[1]); let out="";
 for(const s of streams){
  for(const m of s.matchAll(/\(([^()]*)\)\s*Tj/g))out+=m[1]+"\n";
  for(const m of s.matchAll(/\[((?:[^\]]|\][^\]])*)\]\s*TJ/g))out+=m[1].replace(/\(([^()]*)\)/g,"$1")+"\n";
 }
 return out;
}