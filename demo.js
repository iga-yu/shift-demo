'use strict';
const site = document.body.dataset.site;
const names = ['デモ担当A','デモ担当B','デモ担当C'];
const query = new URLSearchParams(location.search);
const today = new Date();
const iso = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const date = query.get('date') || iso(today);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) throw Error('日付が不正です');
if (!query.has('date')) { query.set('date',date); history.replaceState(null,'','?'+query); }
document.getElementById('date').value=date;
document.getElementById('date').onchange=e=>{query.set('date',e.target.value);location.search=query;};
const prefix='shift-review-demo:v1:'+site+':';
const id = /^[123]$/.test(query.get('staff')) ? query.get('staff') : '1';
const key=prefix+date+(site==='estama'?':'+id:'');
function select(name, field, kind) {
 const el=document.createElement('select');el.name=name;el.id=field;
 const values=kind==='room' ? [['','未設定'],['211','八丁堀・茅場町（サンプル）'],['299','人形町（サンプル）'],['451','門前仲町（サンプル）']] : [['','休み'],...Array.from({length:60},(_,i)=>{const text=`${Math.floor(i/2)}:${i%2?'30':'00'}`;return [site==='official'?String(i*30):site==='ranking'?`${String(Math.floor(i/2)%24).padStart(2,'0')}:${i%2?'30':'00'}`:text,text];})];
 for(const [value,text] of values){if([...el.options].some(o=>o.value===value))continue;el.add(new Option(text,value));}
 el.value=kind==='room'?'211':site==='official'?'600':site==='ranking'?'10:00':'10:00';return el;
}
const form=document.getElementById('schedule');form.action=location.href;
const table=document.createElement('table');form.append(table);
const heading=table.createTHead().insertRow();
for(const label of ['ID','担当者','開始','終了',...(site==='official'?['部屋','出勤解除']:site==='ranking'?['時間未定','出勤解除']:['出勤解除'])]){const th=document.createElement('th');th.scope='col';th.textContent=label;heading.append(th);}
const tbody=table.createTBody();
if(site==='estama') {
 const nav=document.getElementById('staff');
 names.forEach((name,i)=>{const a=document.createElement('a');a.dataset.demoTherapist='';a.href=`estama.html?date=${date}&staff=${i+1}`;const span=document.createElement('span');span.className='item-name';span.textContent=name;a.append(span);nav.append(a);});
 const p=document.createElement('p');p.textContent=names[Number(id)-1]+'の出勤設定ページです。';form.prepend(p);
}
const rows=site==='estama'?[Number(id)]:[1,2,3];
for(const n of rows){
 const row=tbody.insertRow();row.dataset.girlId=String(n);
 row.insertCell().textContent=String(n);
 const span=document.createElement('span');span.id='CastName-'+n;span.textContent=names[n-1];row.insertCell().append(span);
 const start=select(site==='estama'?`column[${date}][select][select_start]`:`shift[${n}][start_work]`,`Form-${n}-start_at`);
 const end=select(site==='estama'?`column[${date}][select][select_end]`:`shift[${n}][end_work]`,`Form-${n}-finish_at`);
 row.insertCell().append(start);row.insertCell().append(end);
 if(site==='official')row.insertCell().append(select('',`Form-${n}-shop_room_id`,'room'));
 if(site==='ranking')for(const [field,label] of [['is_time_not_set','時間未定'],['delete_flag','出勤解除']]){const l=document.createElement('label');const c=document.createElement('input');c.type='checkbox';c.name=`shift[${n}][${field}]`;l.append(c,label);row.insertCell().append(l);}
 else {const b=document.createElement('button');b.type='button';b.id='ClearBtn-'+n;b.className='sce_reset';b.dataset.tg=`column[${date}]`;b.textContent=site==='official'?'クリア':'リセット';b.onclick=()=>{start.value='';end.value='';};row.insertCell().append(b);}
}
const save=document.createElement('button');save.type='submit';save.id=site==='official'?'Form-submit_btn':site==='estama'?'SendWorkSchedule':'save';save.textContent=site==='ranking'?'保存する':site==='official'?'登録する':'出勤情報を保存する';form.append(save);
const fields=()=>[...form.querySelectorAll('select,input')];
function snapshot(){return fields().map(e=>({value:e.value,checked:e.checked}));}
const initial=snapshot();
function restore(data){if(!Array.isArray(data)||data.length!==fields().length)throw Error('保存データ形式が不正です。初期化してください');fields().forEach((e,i)=>{e.value=data[i].value;if(e.type==='checkbox')e.checked=!!data[i].checked;});}
try{const stored=localStorage.getItem(key);if(stored)restore(JSON.parse(stored));document.getElementById('saved').textContent=stored?'ブラウザー保存済みの値を復元しました。':'初期値（未保存）です。';}catch(error){document.getElementById('saved').textContent=error.message;}
form.onsubmit=e=>{e.preventDefault();try{localStorage.setItem(key,JSON.stringify(snapshot()));location.reload();}catch(error){document.getElementById('saved').textContent='保存失敗：'+error.message;}};
document.getElementById('reset').onclick=()=>{if(!confirm('このテスト画面の全日付・全担当者の保存を初期化しますか？'))return;Object.keys(localStorage).filter(k=>k.startsWith(prefix)).forEach(k=>localStorage.removeItem(k));restore(initial);location.reload();};
