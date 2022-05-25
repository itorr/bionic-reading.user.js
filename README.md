# 网页英文前部加粗 用户脚本
把英文每个词前半部加粗，阅读速度可能可以大幅度提高

This repository only is simply Bold half of the words, Not real **Bionic Reading**. 
The real one is in https://bionic-reading.com/

## 快捷键
<kbd>⌘</kbd>  + <kbd>B</kbd> or <kbd>Ctrl</kbd> + <kbd>B</kbd> 复原、重做

## 选项
配置选项放在了 油猴脚本 存储 中。

编辑对应脚本、切换到存储选项卡，编辑 `config` JSON

> 如果 储存 选项卡不可见：在油猴控制面板 (Dashboard) - 设置 (Settings) - 通用 (General) - 配置模式 (Config mode) - 选择 高级 (Advanced) 

```JavaScript
{
    "config": {
        "key": "b", // 自定义 ( Ctrl / ⌘ ) + ？ 快捷键
        "autoBionic": true, // 开启页面默认运行
        "skipLinks": false, // 跳过链接
        "skipWords": false, // 跳过特定单词
        "scale": 0.5, // 单词高亮的长度比例
        "maxBionicLength": null, // 单词最长高亮数量
        "opacity": 1, // 高亮单词 透明度
        "saccade": 0, // 间隔高亮 改成数字 1 即 隔一个单词高亮一个
        "symbolMode": false, // 符号模式替换，替换原本字符 但 不影响 DOM 结构
        "excludeWords": [ // 跳过的单词们，skipWords 不开启不生效
            "is",
            "as",
            "if",
            "the",
            "of",
            "to",
            "be",
            "for",
            "this"
        ],
    }
}
```

## 如何恢复默认选项
清空脚本对应存储内容即可


## 什么是用户脚本？
用户脚本是一段代码，它们能够优化您的网页浏览体验。安装之后，有些脚本能为网站添加新的功能，有些能使网站的界面更加易用，有些则能隐藏网站上烦人的部分内容。用户脚本都是由用户编写并向全世界发表的，您可以免费安装，轻松体验。

安装过程可参考 https://greasyfork.org/ 首页的，第一步：安装一个用户脚本管理器 章节

## Greasy Fork
https://greasyfork.org/scripts/445211

## GitHub
https://github.com/itorr/bionic-reading.user.js

## 衍生
中文版本的尝试 [@zcf0508/bionic-reading.user.js](https://github.com/zcf0508/bionic-reading.user.js)

Chrome Extension [@ivan-robic/bionic-reading](https://github.com/ivan-robic/bionic-reading)

## 微博
https://weibo.com/1197780522/LtIj8bGbo
