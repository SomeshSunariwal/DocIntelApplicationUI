import {initialDocuments,searchResults,generatedDocuments} from '../data/mockData';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const allDocuments = [...initialDocuments, ...generatedDocuments];
export async function getDocuments(offset=0,limit=8){await wait(180);return allDocuments.slice(offset,offset+limit)}
export function getDocumentTotal(){return allDocuments.length}
export async function searchDocuments(query){await wait(220);if(query.trim().length<3)return [];const q=query.trim().toLowerCase();if(q.includes('machine learning')||q==='machine'||q==='learning')return searchResults;return searchResults.filter(r=>(r.name+' '+r.snippet).toLowerCase().includes(q))}
export async function uploadDocument(file,onProgress){for(let p=10;p<=100;p+=10){await wait(60);onProgress?.(p)}return{id:crypto.randomUUID(),name:file.name,type:file.name.split('.').pop().toLowerCase(),size:file.size<1024*1024?`${Math.max(1,Math.round(file.size/1024))} KB`:`${(file.size/1024/1024).toFixed(1)} MB`,date:'Today',status:'completed',pages:file.type==='application/pdf'?42:1,url:URL.createObjectURL(file)}}
