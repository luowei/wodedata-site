/*!
 * 现代Web特性增强
 * 包含 PWA、Web Share API、Intersection Observer 等现代特性
 */

(function() {
  'use strict';

  // 现代Web特性管理器
  const ModernFeatures = {
    init: function() {
      this.initPWA();
      this.initWebShare();
      this.initIntersectionObserver();
      this.initWebVitals();
      this.initDarkMode();
      this.initNotifications();
      this.initOfflineDetection();
      this.initVibration();
      this.initClipboard();
      this.initFullscreen();
    },

    // PWA功能初始化
    initPWA: function() {
      // Service Worker 注册
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
              console.log('SW registered: ', registration);

              // 检查更新
              registration.addEventListener('updatefound', function() {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', function() {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // 显示更新提示
                    ModernFeatures.showUpdateNotification();
                  }
                });
              });
            })
            .catch(function(registrationError) {
              console.log('SW registration failed: ', registrationError);
            });
        });

        // 监听SW消息
        navigator.serviceWorker.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
            ModernFeatures.showUpdateNotification();
          }
        });
      }

      // 安装提示
      let deferredPrompt;
      window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        ModernFeatures.showInstallPrompt(deferredPrompt);
      });

      // 应用安装后
      window.addEventListener('appinstalled', function(evt) {
        console.log('应用已安装');
        ModernFeatures.hideInstallPrompt();

        // 发送安装事件到分析
        if (typeof gtag !== 'undefined') {
          gtag('event', 'app_installed', {
            method: 'pwa'
          });
        }
      });
    },

    // Web Share API
    initWebShare: function() {
      const shareButtons = document.querySelectorAll('[data-share]');

      shareButtons.forEach(button => {
        if (navigator.share) {
          button.addEventListener('click', async function(e) {
            e.preventDefault();

            const title = this.dataset.title || document.title;
            const text = this.dataset.text || document.querySelector('meta[name="description"]')?.content || '';
            const url = this.dataset.url || window.location.href;

            try {
              await navigator.share({
                title: title,
                text: text,
                url: url
              });

              // 发送分享事件
              if (typeof gtag !== 'undefined') {
                gtag('event', 'share', {
                  method: 'web_share_api',
                  content_type: 'article',
                  item_id: url
                });
              }
            } catch (err) {
              console.log('分享失败:', err);
              // 降级到复制链接
              ModernFeatures.copyToClipboard(url);
            }
          });
        } else {
          // 降级处理：显示传统分享选项
          button.addEventListener('click', function(e) {
            e.preventDefault();
            ModernFeatures.showTraditionalShare(this);
          });
        }
      });
    },

    // Intersection Observer 增强
    initIntersectionObserver: function() {
      // 阅读进度指示器
      const progressBar = document.querySelector('.reading-progress');
      if (progressBar) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const progress = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
              progressBar.style.width = progress + '%';
            }
          });
        });

        observer.observe(document.body);
      }

      // 元素动画触发
      const animatedElements = document.querySelectorAll('[data-animate]');
      const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const animation = entry.target.dataset.animate;
            entry.target.classList.add('animate-' + animation);
            animationObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1
      });

      animatedElements.forEach(el => animationObserver.observe(el));

      // 无限滚动
      this.initInfiniteScroll();
    },

    // Web Vitals 监控
    initWebVitals: function() {
      // 动态导入 web-vitals 库
      if (typeof gtag !== 'undefined') {
        // 简化版的 Core Web Vitals 监控
        window.addEventListener('load', function() {
          // Largest Contentful Paint
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            gtag('event', 'web_vitals', {
              metric_name: 'LCP',
              metric_value: Math.round(lastEntry.startTime),
              metric_id: 'lcp_' + Math.random().toString(36).substr(2, 9)
            });
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // First Input Delay
          new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
              gtag('event', 'web_vitals', {
                metric_name: 'FID',
                metric_value: Math.round(entry.processingStart - entry.startTime),
                metric_id: 'fid_' + Math.random().toString(36).substr(2, 9)
              });
            });
          }).observe({ entryTypes: ['first-input'] });
        });
      }
    },

    // 深色模式
    initDarkMode: function() {
      const darkModeToggle = document.getElementById('dark-mode-toggle');
      if (!darkModeToggle) return;

      // 读取本地存储的主题设置
      const currentTheme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

      document.documentElement.setAttribute('data-theme', currentTheme);
      darkModeToggle.checked = currentTheme === 'dark';

      // 切换主题
      darkModeToggle.addEventListener('change', function() {
        const theme = this.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // 发送主题切换事件
        if (typeof gtag !== 'undefined') {
          gtag('event', 'theme_change', {
            theme_mode: theme
          });
        }
      });

      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          const theme = e.matches ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', theme);
          darkModeToggle.checked = theme === 'dark';
        }
      });
    },

    // 通知功能
    initNotifications: function() {
      // 检查通知权限
      if ('Notification' in window && 'serviceWorker' in navigator) {
        // 显示通知权限请求按钮
        const notificationButton = document.getElementById('enable-notifications');
        if (notificationButton) {
          notificationButton.addEventListener('click', async function() {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              this.style.display = 'none';
              ModernFeatures.showNotification('通知已启用', '您将收到网站更新通知');
            }
          });

          // 如果已经有权限，隐藏按钮
          if (Notification.permission === 'granted') {
            notificationButton.style.display = 'none';
          }
        }
      }
    },

    // 离线检测
    initOfflineDetection: function() {
      const offlineIndicator = document.getElementById('offline-indicator') || this.createOfflineIndicator();

      function updateOnlineStatus() {
        if (navigator.onLine) {
          offlineIndicator.classList.remove('show');
          // 检查是否有缓存的数据需要同步
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SYNC_DATA' });
          }
        } else {
          offlineIndicator.classList.add('show');
        }
      }

      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      updateOnlineStatus();
    },

    // 振动 API
    initVibration: function() {
      const vibrateElements = document.querySelectorAll('[data-vibrate]');
      vibrateElements.forEach(el => {
        el.addEventListener('click', function() {
          if ('vibrate' in navigator) {
            const pattern = this.dataset.vibrate.split(',').map(Number);
            navigator.vibrate(pattern);
          }
        });
      });
    },

    // 剪贴板 API
    initClipboard: function() {
      const copyButtons = document.querySelectorAll('[data-clipboard]');
      copyButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
          e.preventDefault();
          const text = this.dataset.clipboard || this.textContent;
          await ModernFeatures.copyToClipboard(text);
        });
      });
    },

    // 全屏 API
    initFullscreen: function() {
      const fullscreenButton = document.getElementById('fullscreen-toggle');
      if (fullscreenButton && document.fullscreenEnabled) {
        fullscreenButton.addEventListener('click', function() {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
        });

        document.addEventListener('fullscreenchange', function() {
          fullscreenButton.textContent = document.fullscreenElement ? '退出全屏' : '全屏';
        });
      }
    },

    // 工具方法
    copyToClipboard: async function(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.showToast('已复制到剪贴板');
      } catch (err) {
        // 降级处理
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showToast('已复制到剪贴板');
      }
    },

    showNotification: function(title, body, options = {}) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/assets/icons/icon-192x192.png',
          ...options
        });
      }
    },

    showToast: function(message, duration = 3000) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;

      document.body.appendChild(toast);

      // 触发动画
      setTimeout(() => toast.style.opacity = '1', 100);

      // 移除 toast
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, duration);
    },

    showUpdateNotification: function() {
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #667eea; color: white; padding: 16px; border-radius: 8px; z-index: 10001; max-width: 300px;">
          <h4 style="margin: 0 0 8px 0;">发现新版本</h4>
          <p style="margin: 0 0 12px 0; font-size: 14px;">网站有新的更新可用</p>
          <div style="display: flex; gap: 8px;">
            <button onclick="this.closest('div').remove()" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">稍后</button>
            <button onclick="location.reload()" style="background: white; color: #667eea; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">立即更新</button>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
    },

    showInstallPrompt: function(deferredPrompt) {
      const installBanner = document.createElement('div');
      installBanner.id = 'install-banner';
      installBanner.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 20px; right: 20px; background: #667eea; color: white; padding: 16px; border-radius: 8px; z-index: 10001; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h4 style="margin: 0 0 4px 0;">安装应用</h4>
            <p style="margin: 0; font-size: 14px;">将 WodeData Blog 添加到主屏幕</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="this.closest('div').remove()" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">取消</button>
            <button id="install-button" style="background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">安装</button>
          </div>
        </div>
      `;

      document.body.appendChild(installBanner);

      document.getElementById('install-button').addEventListener('click', function() {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('用户接受了安装提示');
          }
          deferredPrompt = null;
          document.getElementById('install-banner').remove();
        });
      });
    },

    hideInstallPrompt: function() {
      const banner = document.getElementById('install-banner');
      if (banner) {
        banner.remove();
      }
    },

    createOfflineIndicator: function() {
      const indicator = document.createElement('div');
      indicator.id = 'offline-indicator';
      indicator.innerHTML = '⚠️ 您当前处于离线状态';
      indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #e74c3c;
        color: white;
        text-align: center;
        padding: 8px;
        z-index: 10002;
        transform: translateY(-100%);
        transition: transform 0.3s ease;
      `;

      const style = document.createElement('style');
      style.textContent = `
        #offline-indicator.show {
          transform: translateY(0);
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(indicator);

      return indicator;
    },

    showTraditionalShare: function(button) {
      const title = button.dataset.title || document.title;
      const url = button.dataset.url || window.location.href;

      const shareOptions = [
        { name: '微信', url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}` },
        { name: '微博', url: `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}` },
        { name: 'QQ', url: `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}` },
        { name: 'Twitter', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
        { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` }
      ];

      // 创建分享弹窗
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10003;
      `;

      const content = document.createElement('div');
      content.style.cssText = `
        background: white;
        padding: 24px;
        border-radius: 12px;
        max-width: 400px;
        width: 90%;
      `;

      content.innerHTML = `
        <h3 style="margin: 0 0 16px 0;">分享到</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 12px;">
          ${shareOptions.map(option => `
            <a href="${option.url}" target="_blank" rel="noopener" style="display: flex; flex-direction: column; align-items: center; padding: 12px; text-decoration: none; color: #333; border: 1px solid #ddd; border-radius: 8px; transition: background 0.2s;">
              <span style="font-size: 14px;">${option.name}</span>
            </a>
          `).join('')}
        </div>
        <button onclick="this.closest('div').closest('div').remove()" style="width: 100%; margin-top: 16px; padding: 8px; background: #f0f0f0; border: none; border-radius: 6px; cursor: pointer;">关闭</button>
      `;

      modal.appendChild(content);
      document.body.appendChild(modal);

      // 点击背景关闭
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          modal.remove();
        }
      });
    },

    // 无限滚动
    initInfiniteScroll: function() {
      const loadMoreButton = document.querySelector('[data-load-more]');
      if (!loadMoreButton) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !loadMoreButton.disabled) {
            loadMoreButton.click();
          }
        });
      });

      observer.observe(loadMoreButton);
    }
  };

  // 初始化现代Web特性
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      ModernFeatures.init();
    });
  } else {
    ModernFeatures.init();
  }

  // 导出到全局
  window.ModernFeatures = ModernFeatures;

})();