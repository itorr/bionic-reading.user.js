// ==UserScript==
// @name         英文前部加粗
// @namespace    https://github.com/itorr/bionic-reading.user.js
// @version      0.6
// @description  网页英文前部加粗脚本
// @author       itorr
// @match        *://*/*
// @grant        none
// @license      MIT
// @run-at       document-idle
// ==/UserScript==

const styleEl = document.createElement('style');
styleEl.innerHTML = 'bbb{font-weight:bold;}';

let textEls = [];
const excludeTagNames = ['script','style','xmp','input','textarea','pre','code'].map(a=>a.toUpperCase());
const gather = el=>{
    el.childNodes.forEach(el=>{
        if(el.isEnB) return;

        if(el.nodeType === 3){
            textEls.push(el);
        }else if(el.childNodes){
            if(excludeTagNames.includes(el.tagName)) return;
            gather(el)
        }
    })
};

let body = document.body;


if(/weibo/.test(location.hostname)){
    const wbMain = document.querySelector('.WB_main');
    if(wbMain){
        body = wbMain;
    }
}

const customStyleEl = document.querySelector('#custom_style');
if(customStyleEl)customStyleEl.removeAttribute('id');


console.log({body})

const enCodeHTML = s=> s.replace(/[\u00A0-\u9999<>\&]/g, function(i) {
    return '&#'+i.charCodeAt(0)+';';
 });

const run = _=>{
    textEls = [];
    gather(body);

    textEls.forEach(textEl=>{
        const text = textEl.data;
        if(!/[a-z][a-z0-9]+/i.test(text))return;

        const spanEl = document.createElement('spann');
        spanEl.isEnB = true;
        spanEl.innerHTML = enCodeHTML(text).replace(/[a-z][a-z0-9]+/ig,word=>{
            const halfLength = Math.ceil(word.length/2);
            return '<bbb>'+word.substr(0,halfLength)+'</bbb>'+word.substr(halfLength)
        })
        textEl.after(spanEl);
        textEl.remove();
    });
    document.head.appendChild(styleEl);
}
run();
const _run = ms=> _=>setTimeout(run,ms);

const {open,send} = XMLHttpRequest.prototype;

XMLHttpRequest.prototype.open = function(){
    this.addEventListener('load',_run(200));
    return open.apply(this,arguments);
};

document.addEventListener('click',_run(250));
window.addEventListener('load',_run(200));
document.addEventListener("DOMContentLoaded",_run(200));

