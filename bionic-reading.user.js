// ==UserScript==
// @name         英文前部加粗
// @namespace    https://github.com/itorr/bionic-reading.user.js
// @version      0.8.4
// @description  网页英文前部加粗脚本 Ctrl + B / ⌘ + B 开启关闭
// @author       itorr
// @match        *://*/*
// @grant        none
// @license      MIT
// @run-at       document-idle
// @supportURL   https://github.com/itorr/bionic-reading.user.js/issues
// ==/UserScript==

let defaultOn = true;

let isBionic = false;

const enCodeHTML = s=> s.replace(/[\u00A0-\u9999<>\&]/g,w=>'&#'+w.charCodeAt(0)+';');

let body = document.body;

if(/weibo/.test(location.hostname)){
    const wbMainEl = document.querySelector('.WB_main');
    if(wbMainEl) body = wbMainEl;

    // 修复旧版微博自定义样式失效 bug
    const customStyleEl = document.querySelector('#custom_style');
    if(customStyleEl) customStyleEl.removeAttribute('id');
}

const styleEl = document.createElement('style');
styleEl.innerHTML = `
bbb{
    font-weight:bold;
    opacity: 1;
}
html[data-site="greasyfork"] a bionic{
    pointer-events: none;
}
`;

document.documentElement.setAttribute('data-site',location.hostname.replace(/\.\w+$|www\./ig,''))

const excludeNodeNames = [
    'script','style','xmp',
    'input','textarea','select',
    'pre','code',
    'h1','h2', // 'h3','h4',
    'b','strong',
    'svg','embed',
    'img','audio','video',
    'canvas',
];

const excludeClasses = [
    'highlight',
    'katex',
    'editor',
]
const excludeClassesRegexi = new RegExp(excludeClasses.join('|'),'i');

const gather = el=>{
    let textEls = [];
    el.childNodes.forEach(el=>{
        if(el.isEnB) return;
        if(el.originEl) return;

        if(el.nodeType === 3){
            textEls.push(el);
        }else if(el.childNodes){
            if(excludeNodeNames.includes(el.nodeName.toLowerCase())) return;
            if(el.getAttribute && el.getAttribute('class') && excludeClassesRegexi.test(el.getAttribute('class'))) return;
            textEls = textEls.concat(gather(el))
        }
    })
    return textEls;
};

const engRegex = /[a-zA-Z][a-z]+/;
const engRegexg = new RegExp(engRegex,'g');
let replaceTextByEl = el=>{
    const text = el.data;
    if(!engRegex.test(text))return;

    if(!el.replaceEl){
        const spanEl = document.createElement('bionic');
        spanEl.isEnB = true;
        spanEl.innerHTML = enCodeHTML(text).replace(engRegexg,word=>{
            let halfLength;
            if(/ing$/.test(word)){
                halfLength = word.length - 3;
            }else if(word.length<5){
                halfLength = Math.floor(word.length/2);
            }else{
                halfLength = Math.ceil(word.length/2);
            }
            return '<bbb>'+word.substr(0,halfLength)+'</bbb>'+word.substr(halfLength)
        })
        spanEl.originEl = el;
        el.replaceEl = spanEl;
    }

    el.after(el.replaceEl);
    el.remove();
};

//     replaceTextByEl = el=>{
//         el.data = el.data.replace(engRegexg,word=>{
//             let halfLength;
//             if(/ing$/.test(word)){
//                 halfLength = word.length - 3;
//             }else if(word.length<5){
//                 halfLength = Math.floor(word.length/2);
//             }else{
//                 halfLength = Math.ceil(word.length/2);
//             }
//             const a = word.substr(0,halfLength).
//                 replace(/[a-z]/g,w=>'\uD835' + String.fromCharCode(w.charCodeAt(0)+56717)).
//                 replace(/[A-Z]/g,w=>'\uD835' + String.fromCharCode(w.charCodeAt(0)+56723));
//             const b = word.substr(halfLength).
//                 replace(/[a-z]/g,w=> String.fromCharCode(55349,w.charCodeAt(0)+56665)).
//                 replace(/[A-Z]/g,w=> String.fromCharCode(55349,w.charCodeAt(0)+56671));
//             return a + b;
//         })
//     }

const bionic = _=>{
    const textEls = gather(body);

    isBionic = true;

    textEls.forEach(replaceTextByEl);
    document.head.appendChild(styleEl);
}

const lazy = (func,ms = 15)=> {
    return _=>{
        clearTimeout(func.T)
        func.T = setTimeout(func,ms)
    }
};

const listenerFunc = lazy(_=>{
    if(!isBionic) return;

    bionic();
});

const beforeBionic = _=>{
    bionic();
    if(!defaultOn){
        revoke();
    }
}

if(window.MutationObserver){
    (new MutationObserver(listenerFunc)).observe(body,{
        childList: true,
        subtree: true,
        attributes: true,
    });
}else{
    const {open,send} = XMLHttpRequest.prototype;
    XMLHttpRequest.prototype.open = function(){
        this.addEventListener('load',listenerFunc);
        return open.apply(this,arguments);
    };
    document.addEventListener('DOMContentLoaded',listenerFunc);
    document.addEventListener('DOMNodeInserted',listenerFunc);
}


window.addEventListener('load',beforeBionic);
// document.addEventListener('click',listenerFunc);


const revoke = _=>{
    const els = [...document.querySelectorAll('bionic')];

    els.forEach(el=>{
        const {originEl} = el;
        if(!originEl) return;

        el.after(originEl);
        el.remove();
    })

    isBionic = false;
};
// document.addEventListener('mousedown',revoke);

const redo = _=>{
    const textEls = gather(body);

    textEls.forEach(el=>{
        const { replaceEl } = el;

        if(!replaceEl) return;

        el.after(replaceEl);
        el.remove();
    })

    isBionic = false;
};

document.addEventListener('keydown',e=>{
    const { ctrlKey , metaKey, key } = e;

    if( ctrlKey || metaKey ){
        if(key === 'b'){
            if(isBionic){
                revoke();
            }else{
                bionic();
            }
        }
    }
})

// document.addEventListener('mouseup',redo);
