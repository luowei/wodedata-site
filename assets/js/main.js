/*!
 * WodeData Blog - 整合JavaScript文件
 * 包含所有必要的JavaScript功能
 */

(function() {
  'use strict';

  // 工具函数
  var Utils = {
    // 防抖函数
    debounce: function(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    },

    // 节流函数
    throttle: function(func, delay) {
      var lastCall = 0;
      return function() {
        var now = Date.now();
        if (now - lastCall < delay) {
          return;
        }
        lastCall = now;
        return func.apply(this, arguments);
      };
    },

    // 添加CSS类
    addClass: function(el, className) {
      if (el.classList) {
        el.classList.add(className);
      } else {
        el.className += ' ' + className;
      }
    },

    // 移除CSS类
    removeClass: function(el, className) {
      if (el.classList) {
        el.classList.remove(className);
      } else {
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
      }
    },

    // 切换CSS类
    toggleClass: function(el, className) {
      if (el.classList) {
        el.classList.toggle(className);
      } else {
        var classes = el.className.split(' ');
        var existingIndex = classes.indexOf(className);
        if (existingIndex >= 0) {
          classes.splice(existingIndex, 1);
        } else {
          classes.push(className);
        }
        el.className = classes.join(' ');
      }
    },

    // Ajax请求
    ajax: function(url, options) {
      options = options || {};
      var xhr = new XMLHttpRequest();
      var method = options.method || 'GET';
      var data = options.data || null;

      xhr.open(method, url, true);

      if (options.headers) {
        for (var header in options.headers) {
          xhr.setRequestHeader(header, options.headers[header]);
        }
      }

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            if (options.success) {
              options.success(xhr.responseText);
            }
          } else {
            if (options.error) {
              options.error(xhr);
            }
          }
        }
      };

      xhr.send(data);
    }
  };

  // 移动端菜单
  var MobileMenu = {
    init: function() {
      var trigger = document.querySelector('.navbar-mobile-menu');
      var menu = document.querySelector('.navbar-mobile-menu ul');

      if (trigger && menu) {
        trigger.addEventListener('click', function() {
          Utils.toggleClass(menu, 'active');
          Utils.toggleClass(trigger, 'active');
        });
      }
    }
  };

  // 搜索功能
  var Search = {
    init: function() {
      var searchInput = document.querySelector('#cb-search-content');
      var searchResults = document.querySelector('.search-results');

      if (searchInput) {
        var searchFunction = Utils.debounce(this.performSearch, 300);
        searchInput.addEventListener('input', searchFunction);
      }
    },

    performSearch: function() {
      var query = this.value.toLowerCase().trim();

      if (query.length < 2) {
        Search.hideResults();
        return;
      }

      // 这里可以实现搜索逻辑
      // 可以搜索页面中的内容或通过Ajax搜索
      console.log('搜索:', query);
    },

    hideResults: function() {
      var searchResults = document.querySelector('.search-results');
      if (searchResults) {
        searchResults.style.display = 'none';
      }
    }
  };

  // 滚动到顶部
  var ScrollToTop = {
    init: function() {
      var button = document.createElement('button');
      button.innerHTML = '↑';
      button.className = 'scroll-to-top';
      button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: #2a7ae2;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        z-index: 1000;
        font-size: 18px;
        transition: all 0.3s ease;
      `;

      document.body.appendChild(button);

      var showButton = Utils.throttle(function() {
        if (window.pageYOffset > 300) {
          button.style.display = 'block';
        } else {
          button.style.display = 'none';
        }
      }, 100);

      window.addEventListener('scroll', showButton);

      button.addEventListener('click', function() {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  };

  // 图片懒加载
  var LazyLoad = {
    init: function() {
      var images = document.querySelectorAll('img[data-src]');

      if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              var img = entry.target;
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          });
        });

        images.forEach(function(img) {
          observer.observe(img);
        });
      } else {
        // 回退方案
        images.forEach(function(img) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        });
      }
    }
  };

  // 代码高亮（如果需要）
  var CodeHighlight = {
    init: function() {
      var codeBlocks = document.querySelectorAll('pre code');

      codeBlocks.forEach(function(block) {
        // 添加行号
        var lines = block.innerHTML.split('\n');
        var lineNumbers = '';
        var codeLines = '';

        lines.forEach(function(line, index) {
          if (line.trim() !== '') {
            lineNumbers += '<span class="line-number">' + (index + 1) + '</span>\n';
            codeLines += '<span class="code-line">' + line + '</span>\n';
          }
        });

        block.innerHTML = '<div class="code-container">' +
          '<div class="line-numbers">' + lineNumbers + '</div>' +
          '<div class="code-content">' + codeLines + '</div>' +
          '</div>';
      });
    }
  };

  // 表单处理
  var FormHandler = {
    init: function() {
      var forms = document.querySelectorAll('form');

      forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
          if (!FormHandler.validateForm(form)) {
            e.preventDefault();
            return false;
          }
        });
      });
    },

    validateForm: function(form) {
      var isValid = true;
      var requiredFields = form.querySelectorAll('[required]');

      requiredFields.forEach(function(field) {
        if (!field.value.trim()) {
          Utils.addClass(field, 'error');
          isValid = false;
        } else {
          Utils.removeClass(field, 'error');
        }
      });

      return isValid;
    }
  };

  // 性能监控
  var Performance = {
    init: function() {
      // 监控页面加载时间
      window.addEventListener('load', function() {
        setTimeout(function() {
          var loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
          console.log('页面加载时间:', loadTime + 'ms');

          // 可以发送到分析服务
          if (typeof gtag !== 'undefined') {
            gtag('event', 'timing_complete', {
              'name': 'load',
              'value': Math.round(loadTime)
            });
          }
        }, 0);
      });
    }
  };

  // 主初始化函数
  var App = {
    init: function() {
      // DOM就绪后初始化各个模块
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          App.initModules();
        });
      } else {
        App.initModules();
      }
    },

    initModules: function() {
      try {
        MobileMenu.init();
        Search.init();
        ScrollToTop.init();
        LazyLoad.init();
        CodeHighlight.init();
        FormHandler.init();
        Performance.init();

        console.log('WodeData Blog JavaScript 初始化完成');
      } catch (error) {
        console.error('初始化错误:', error);
      }
    }
  };

  // 启动应用
  App.init();

})();

// 兼容性检查和polyfills
(function() {
  // Object.assign polyfill
  if (typeof Object.assign !== 'function') {
    Object.assign = function(target) {
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) {
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    };
  }

  // Array.forEach polyfill
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {
      var T, k;
      if (this == null) {
        throw new TypeError(' this is null or not defined');
      }
      var O = Object(this);
      var len = parseInt(O.length) || 0;
      if (typeof callback !== "function") {
        throw new TypeError(callback + ' is not a function');
      }
      if (arguments.length > 1) {
        T = thisArg;
      }
      k = 0;
      while (k < len) {
        var kValue;
        if (k in O) {
          kValue = O[k];
          callback.call(T, kValue, k, O);
        }
        k++;
      }
    };
  }
})();