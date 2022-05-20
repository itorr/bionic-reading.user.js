// ==UserScript==
// @name         英文前部加粗
// @namespace    https://github.com/itorr/bionic-reading.user.js
// @version      0.8
// @description  网页英文前部加粗脚本
// @author       itorr
// @match        *://*/*
// @grant        none
// @license      MIT
// @run-at       document-idle
// @supportURL   https://github.com/itorr/bionic-reading.user.js/issuse
// ==/UserScript==

const enCodeHTML = s=> s.replace(/[\u00A0-\u9999<>\&]/g,w=>'&#'+w.charCodeAt(0)+';');

let body = document.body;

if(/weibo/.test(location.hostname)){
    const wbMainEl = document.querySelector('.WB_main');
    if(wbMainEl) body = wbMainEl;

    // 修复旧版微博自定义样式失效 bug
    const customStyleEl = document.querySelector('#custom_style');
    if(customStyleEl)customStyleEl.removeAttribute('id');
}

const styleEl = document.createElement('style');
styleEl.innerHTML = 'bbb{font-weight:bold;}';

const excludeTagNames = [
    'script','style','xmp',
    'input','textarea',
    'pre','code',
    'h1','h2','h3','h4',
    'b','strong'
].map(a=>a.toUpperCase());

const gather = el=>{
    let textEls = [];
    el.childNodes.forEach(el=>{
        if(el.isEnB) return;

        if(el.nodeType === 3){
            textEls.push(el);
        }else if(el.childNodes){
            if(excludeTagNames.includes(el.tagName)) return;
            textEls = textEls.concat(gather(el))
        }
    })
    return textEls;
};

const engRegexi  = /[a-z][a-z0-9]+/i;
const engRegexig = /[a-z][a-z0-9]+/ig;
const bionic = _=>{
    const textEls = gather(body);

    textEls.forEach(textEl=>{
        const text = textEl.data;
        if(!engRegexi.test(text))return;

        const spanEl = document.createElement('spann');
        spanEl.isEnB = true;
        spanEl.innerHTML = enCodeHTML(text).replace(engRegexig,word=>{

            if(/ing$/.test(word)){
                halfLength = word.length - 3;
            }else if(word.length<5){
                halfLength = Math.floor(word.length/2);
            }else{
                halfLength = Math.ceil(word.length/2);
            }

            return '<bbb>'+word.substr(0,halfLength)+'</bbb>'+word.substr(halfLength)
        })
        textEl.after(spanEl);
        textEl.remove();
    });
    document.head.appendChild(styleEl);
}

const lazy = (func,ms = 0)=> {
    return _=>{
        clearTimeout(func.T)
        func.T = setTimeout(func,ms)
    }
};
lazy(bionic);

const {open,send} = XMLHttpRequest.prototype;
XMLHttpRequest.prototype.open = function(){
    this.addEventListener('load',lazy(bionic));
    return open.apply(this,arguments);
};
document.addEventListener('click',lazy(bionic));
window.addEventListener('load',lazy(bionic));
document.addEventListener("DOMContentLoaded",lazy(bionic));