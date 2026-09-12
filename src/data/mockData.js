export const initialDocuments = [
 {id:'1',name:'Product_Requirements.pdf',type:'pdf',size:'2.4 MB',date:'Aug 28, 2024',status:'completed',pages:42,url:'/mock-files/product-requirements.pdf'},
 {id:'2',name:'Technical_Design.docx',type:'docx',size:'1.8 MB',date:'Aug 26, 2024',status:'completed',pages:18,url:'/mock-files/technical-design.docx'},
 {id:'3',name:'Meeting_Notes.txt',type:'txt',size:'320 KB',date:'Aug 24, 2024',status:'completed',pages:3,url:'/mock-files/meeting-notes.txt'},
 {id:'4',name:'AI_Research_Paper.pdf',type:'pdf',size:'4.1 MB',date:'Aug 20, 2024',status:'uploading',progress:68,pages:24},
 {id:'5',name:'Q3_Financial_Report.pdf',type:'pdf',size:'5.2 MB',date:'Aug 19, 2024',status:'processing',pages:32},
 {id:'6',name:'User_Guide.pdf',type:'pdf',size:'4.1 MB',date:'Aug 20, 2024',status:'completed',pages:28},
 {id:'7',name:'Project_Timeline.pdf',type:'pdf',size:'2.9 MB',date:'Aug 16, 2024',status:'failed',pages:12},
 {id:'8',name:'Architecture_Diagram.pdf',type:'pdf',size:'3.6 MB',date:'Aug 15, 2024',status:'completed',pages:9},
 {id:'9',name:'Interview_Prep_Notes.txt',type:'txt',size:'280 KB',date:'Aug 12, 2024',status:'completed',pages:7},
 {id:'10',name:'Project_Timeline_v2.pdf',type:'pdf',size:'1.7 MB',date:'Aug 10, 2024',status:'completed',pages:16},
 {id:'11',name:'Security_Architecture.docx',type:'docx',size:'2.1 MB',date:'Aug 08, 2024',status:'completed',pages:22},
 {id:'12',name:'Customer_Research.txt',type:'txt',size:'410 KB',date:'Aug 05, 2024',status:'completed',pages:6},
 {id:'13',name:'API_Reference.pdf',type:'pdf',size:'6.2 MB',date:'Aug 02, 2024',status:'completed',pages:58},
 {id:'14',name:'Deployment_Guide.docx',type:'docx',size:'1.5 MB',date:'Jul 29, 2024',status:'completed',pages:15},
 {id:'15',name:'Release_Notes.txt',type:'txt',size:'190 KB',date:'Jul 27, 2024',status:'completed',pages:4},
 {id:'16',name:'Data_Model.pdf',type:'pdf',size:'3.3 MB',date:'Jul 25, 2024',status:'completed',pages:27},
 {id:'17',name:'Product_Roadmap.pdf',type:'pdf',size:'2.6 MB',date:'Jul 23, 2024',status:'completed',pages:20},
 {id:'18',name:'UX_Research.docx',type:'docx',size:'1.9 MB',date:'Jul 20, 2024',status:'completed',pages:19},
 {id:'19',name:'Compliance_Checklist.txt',type:'txt',size:'155 KB',date:'Jul 18, 2024',status:'completed',pages:5},
 {id:'20',name:'ML_Evaluation.pdf',type:'pdf',size:'4.8 MB',date:'Jul 16, 2024',status:'completed',pages:35},
 {id:'21',name:'Roadmap_2025.pdf',type:'pdf',size:'2.8 MB',date:'Jul 14, 2024',status:'completed',pages:18},
 {id:'22',name:'System_Notes.txt',type:'txt',size:'210 KB',date:'Jul 12, 2024',status:'completed',pages:5},
 {id:'23',name:'Integration_Spec.docx',type:'docx',size:'2.2 MB',date:'Jul 10, 2024',status:'completed',pages:21},
 {id:'24',name:'Analytics_Requirements.pdf',type:'pdf',size:'3.9 MB',date:'Jul 08, 2024',status:'completed',pages:29}
];
export const searchResults = [
 {documentId:'1',name:'Product_Requirements.pdf',type:'pdf',page:12,match:92,snippet:'Machine learning models can significantly improve accuracy and help in extracting meaningful insights from unstructured documents.'},
 {documentId:'2',name:'Technical_Design.docx',type:'docx',page:8,match:87,snippet:'We use machine learning to classify documents and extract structured information from the content pipeline.'},
 {documentId:'5',name:'Q3_Financial_Report.pdf',type:'pdf',page:24,match:78,snippet:'The future scope includes deep learning and machine learning for better predictions and automation.'},
 {documentId:'3',name:'Meeting_Notes.txt',type:'txt',page:3,match:71,snippet:'... challenges in machine learning include data quality, training costs, and model maintenance.'}
];
export const generatedDocuments = Array.from({length:18},(_,i)=>({id:`g-${i}`,name:`Project_Document_${String(i+1).padStart(2,'0')}.pdf`,type:'pdf',size:`${1+i%5}.${i%9} MB`,date:'Jul 05, 2024',status:'completed',pages:10+i%30}));
