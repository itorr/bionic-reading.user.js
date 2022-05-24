// ==UserScript==
// @name              Bionic Reading / ⌘ + B
// @name:zh           英文前部加粗 / ⌘ + B
// @namespace         https://github.com/itorr/bionic-reading.user.js
// @version           0.8.4
// @description       Bionic Reading User Script Ctrl + B / ⌘ + B
// @description:zh    网页英文前部加粗脚本 Ctrl + B / ⌘ + B 开启关闭
// @icon              data:image/vnd.microsoft.icon;base64,AAABAAEAICACAAEAAQAwAQAAFgAAACgAAAAgAAAAQAAAAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABvb28Ab29vAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/////////////////////8AAfH/AABx/wAAMf8AADH/D/gR/w/8Ef8P/BH/D/wR/w/8Ef8P+DH/AAAx/wAAcf8AAPD/AABwfw/wMA8P+DEPD/gxjw/4P/8P8D//AAA//wAAf/8AAP//AAP////////////////////////////8=
// @author            itorr
// @match             *://*/*
// @exclude           /\.(js|java|c|cpp|h|py|css|less|scss|json|yaml|yml|xml)(?:\?.+)$/
// @license           MIT
// @run-at            document-end
// @supportURL        https://github.com/itorr/bionic-reading.user.js/issues
// @grant             GM.registerMenuCommand
// @grant             GM.unregisterMenuCommand
// @grant             GM_registerMenuCommand
// @grant             GM_unregisterMenuCommand
// @grant             GM.getValue
// @grant             GM_getValue
// @grant             GM.setValue
// @grant             GM_setValue
// ==/UserScript==

let base = typeof GM === 'object' ? GM : {
    getValue: typeof GM_getValue === 'function' ? GM_getValue : _=>{},
    setValue: typeof GM_setValue === 'function' ? GM_setValue : _=>{},
    registerMenuCommand : typeof GM_registerMenuCommand === 'function' ? GM_registerMenuCommand : _=>{},
    registerMenuCommand : typeof GM_unregisterMenuCommand === 'function' ? GM_unregisterMenuCommand : _=>{},
}


const defaultConfig = {
    autoBionic: true,
    skipLinks: false,
    skipWords: false,
    scale: 0.5,
    maxBionicLength: null,
    opacity: 1,
    // saccade: 1, // 1 - ~
    symbolMode: false,
    excludeWords:['is','and','as','if','the','of','to','be','for','this'],
};


const config = await (async _=>{
    const _config = await base.getValue('config');
    if(!_config) return defaultConfig;

    for(let key in defaultConfig){
        if(_config[key] === undefined) _config[key] = defaultConfig[key];
    }

    return _config;
})();

try{
    await base.setValue('config',config);
}catch(e){

}

console.log(JSON.stringify(config,0,2))

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
    opacity: ${config.opacity};
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
            if(el.getAttribute){
                if(el.getAttribute('class') && excludeClassesRegexi.test(el.getAttribute('class'))) return;

                // 跳过所有可编辑元素
                if(el.getAttribute('contentEditable') === 'true') return;
            }

            textEls = textEls.concat(gather(el))
        }
    })
    return textEls;
};

const engRegex  = /[a-zA-Z][a-z]+/;
const engRegexg = new RegExp(engRegex,'g');
const getHalfLength = word=>{

    let halfLength;
    if(/ing$/.test(word)){
        halfLength = word.length - 3;
    }else if(word.length<5){
        halfLength = Math.floor(word.length * config.scale);
    }else{
        halfLength = Math.ceil(word.length * config.scale);
    }

    if(config.maxBionicLength){
        halfLength = Math.min(halfLength, config.maxBionicLength)
    }
    return halfLength;
}
const replaceTextByEl = el=>{
    const text = el.data;
    if(!engRegex.test(text))return;

    if(!el.replaceEl){
        const spanEl = document.createElement('bionic');
        spanEl.isEnB = true;
        spanEl.innerHTML = enCodeHTML(text).replace(engRegexg,word=>{
            if(config.skipWords){
                if(config.excludeWords.includes(word)) return word;
            }
            const halfLength = getHalfLength(word);
            return '<bbb>'+word.substr(0,halfLength)+'</bbb>'+word.substr(halfLength)
        })
        spanEl.originEl = el;
        el.replaceEl = spanEl;
    }

    el.after(el.replaceEl);
    el.remove();
};

const replaceTextSymbolModeByEl = el=>{
    el.data = el.data.replace(engRegexg,word=>{
        const halfLength = getHalfLength(word);
        const a = word.substr(0,halfLength).
            replace(/[a-z]/g,w=>String.fromCharCode(55349,w.charCodeAt(0)+56717)).
            replace(/[A-Z]/g,w=>String.fromCharCode(55349,w.charCodeAt(0)+56723));
        const b = word.substr(halfLength).
            replace(/[a-z]/g,w=> String.fromCharCode(55349,w.charCodeAt(0)+56665)).
            replace(/[A-Z]/g,w=> String.fromCharCode(55349,w.charCodeAt(0)+56671));
        return a + b;
    })
}

const bionic = _=>{
    const textEls = gather(body);

    isBionic = true;

    const replaceFunc = config.symbolMode ? replaceTextSymbolModeByEl : replaceTextByEl;

    textEls.forEach(replaceFunc);
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

if(config.autoBionic){ // auto Bionic
    console.log(config.autoBionic)
    window.addEventListener('load',bionic);
}
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


// let id = base.registerMenuCommand ('Setting', function(){
//     // 配置相关
// }, 's');


// document.addEventListener('mouseup',redo);
