(function () {
  'use strict';

  // configuration 
  const ENDPOINT = 'https://collector.cse135w26.com/log.php';  // Replace with your endpoint
  const COOKIE_NAME = '_collector_sid';
  const COOKIE_MAX_AGE = 60 * 60; //1hr

  // session identity

  /**
   * Generate or retrieve a session ID from sessionStorage.
   * Persists across page navigations within the same tab.
   * Clears automatically when the tab or browser closes.
   * No cookies, no cross-site tracking.
   */

  function generateSessionId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  function getCookie(name) {
    const match = document.cookie.split('; ').find(row => row.startsWith(name + '='));
    return match ? match.split('=')[1] : null;
  }

  function setCookie(name, value, maxAgeSeconds) {
    let cookie = `${name}=${value}; path=/; SameSite=Lax`;
    if (maxAgeSeconds) {
      cookie += `; max-age=${maxAgeSeconds}`;
    }
    
    if (location.protocol === 'https:') {
      cookie += '; Secure';
    }

    document.cookie = cookie;

  }

  function getSessionId() {
   let sid = getCookie(COOKIE_NAME);
   if (!sid) {
     sid = generateSessionId();
     
   }
   setCookie(COOKIE_NAME, sid, COOKIE_MAX_AGE);
   // let sid = sessionStorage.getItem('_collector_sid');
   // if (!sid) {
     	// sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
     	// sessionStorage.setItem('_collector_sid', sid);
   // }
    return sid;
  }

  // network information 

  /**
   * Collect network connection data via the Network Information API.
   * Feature-detected: returns an empty object if the API is unavailable
   * (e.g., in Safari or Firefox).
   */
  function getNetworkInfo() {
    if (!('connection' in navigator)) return {};

    const conn = navigator.connection;
    return {
      effectiveType: conn.effectiveType,  // 'slow-2g', '2g', '3g', '4g'
      downlink: conn.downlink,            // Estimated bandwidth in Mbps
      rtt: conn.rtt,                      // Estimated round-trip time in ms
      saveData: conn.saveData             // true if user enabled data saver
    };
  }

  // technographics

  /**
   * Collect a complete technographic profile of the user's environment.
   * All properties are feature-detected with safe fallbacks.
   * Returns a plain object â€” no side effects, no async.
   */
  function getTechnographics() {
    return {
      // Browser identification
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,

      // Viewport (current browser window)
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,

      // Screen (physical display)
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      pixelRatio: window.devicePixelRatio,

      // Hardware
      cores: navigator.hardwareConcurrency || 0,
      memory: navigator.deviceMemory || 0,

      // Network (feature-detected)
      network: getNetworkInfo(),

      // Preferences
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark' : 'light',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  //performance data
  function getPerformanceData() {
    const n = performance.getEntriesByType("navigation")[0];
    if(!n) {
      return {};
    }
   
    const responseStart = n.responseStart;
    const responseEnd = n.responseEnd;
    return {
      responseStart: responseStart,
      responseEnd: responseEnd,
      startTime: n.startTime,
      loadEventStart: n.loadEventStart,
      loadEventEnd: n.loadEventEnd,
      totalLoadTime: n.loadEventEnd - n.startTime,
      domContentLoadedStart: n.domContentLoadedEventStart,
      domContentLoadedEnd: n.domContentLoadedEventEnd

    };

  }

  //activity data
  function getActivityData() {

    //idle detection
    const IDLE_THRESHOLD = 2000; // 2sec
    let pageEnterTime = Date.now();
    let lastActivityTime = Date.now();
    let idleStartTime = null;

    //pg entered	  
    collect('page_enter', {
      page: window.location.href,
      enteredAt: new Date(pageEnterTime).toISOString()
    });

    //activity tracking 
    function registerActivity() {
      const now = Date.now();

      // If user was idle and now resumed
      if (idleStartTime !== null) {
        const idleDuration = now - idleStartTime;

        collect('idle_end', {
          page: window.location.href,
          idleEndedAt: new Date(now).toISOString(),
          idleDurationMs: idleDuration
        });

        idleStartTime = null;
      }

      lastActivityTime = now;
    }

    //idle check loop
    setInterval(function () {
      const now = Date.now();

      if (
        idleStartTime === null &&
        now - lastActivityTime >= IDLE_THRESHOLD
      ) {
        idleStartTime = lastActivityTime;

        collect('idle_start', {
          page: window.location.href,
          idleStartedAt: new Date(idleStartTime).toISOString()
        });
      }

    }, 500);

    //thrown errors
    window.addEventListener('error', function (event) {
      const errorData = {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error ? event.error.stack : null
      };

      collect('js_error', { error: errorData });
    });

    window.addEventListener('unhandledrejection', function (event) {
      const errorData = {
        message: event.reason ? event.reason.message : 'Unhandled rejection',
        stack: event.reason ? event.reason.stack : null
      };

      collect('promise_error', { error: errorData });
    });

    //mouse coordinates
    let lastMouseEventTime = 0;

    document.addEventListener('mousemove', function (event) {
      const now = Date.now();

      if (now - lastMouseEventTime > 1000) { // every 500ms
        lastMouseEventTime = now;
        registerActivity();
        collect('mousemove', {
          mouse: {
            x: event.clientX,
            y: event.clientY
          }
        });
      } 
    });

    //clicks with specific buttons
    document.addEventListener('click', function (event) {
      registerActivity();
      collect('click', {
        mouse: {
          x: event.clientX,
          y: event.clientY,
          button: event.button, // 0=left, 1=middle, 2=right
          element: event.target.tagName
        }
      });
    });

    //scroll position
    let lastScrollTime = 0;

    window.addEventListener('scroll', function () {
      const now = Date.now();

      if (now - lastScrollTime > 1000) {
        lastScrollTime = now;
        registerActivity();
        collect('scroll', {
          scroll: {
            x: window.scrollX,
            y: window.scrollY
          }
        });
      }
    });


    //keyup events
    document.addEventListener("keyup", function (event) {
      const target = event.target;
	
	if (
          target &&
	  ( 
            target.tagName === 'INPUT' ||
	    target.tagName === 'TEXTAREA' ||
	    target.isContentEditable 
	  )
	) {
          return;
	}

	registerActivity();

	collect("keyup", {
          keyboard: {
            key: event.key,
	    code: event.code,
	    location: event.location,
	    repeat: event.repeat,
	    isComposing: event.isComposing,
            altKey: event.altKey,
	    ctrlKey: event.ctrlKey,
	    shiftKey: event.shiftKey,
	    metaKey: event.metaKey
	  }
	});

    });

    //pg exit
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {

        const exitTime = Date.now();
        const totalTimeOnPage = exitTime - pageEnterTime;

        collect('page_exit', {
          page: window.location.href,
          exitedAt: new Date(exitTime).toISOString(),
          totalTimeOnPageMs: totalTimeOnPage
        });
      }
    });
	  

  }

  //payload and delivery

  /**
   * Build the analytics payload and send it via sendBeacon.
   * Extends the Module 01 payload with session ID and technographics.
   */
  function collect(type = 'pageview', extra = {}) {
    const payload = {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      type: type,
      session: getSessionId(),
      technographics: type === 'pageview' ? getTechnographics(): undefined,
      performance: type === 'pageview' ? getPerformanceData(): undefined,
      ...extra
    };

    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, blob);
      console.log('[collector-v2] Beacon sent');
    } else {
      console.warn('[collector-v2] sendBeacon not available');
    }

    console.log('[collector-v2] payload:', payload);

    // Dispatch a custom event so test pages can read the payload
    window.dispatchEvent(new CustomEvent('collector:payload', { detail: payload }));
  }

  //triggers
  // Collect on page load
  window.addEventListener('load', () => {
    console.log('[collector-v2] Page loaded â€” collecting technographics');
    setTimeout(() => {
    	collect();
	getActivityData();
    }, 0);
  });

  // Collect again when the page is being hidden (tab close, navigation away)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      console.log('[collector-v2] Page hidden â€” sending exit beacon');
      collect();
    }
  });

  // Expose functions for the test page
  window.__collector = {
    getTechnographics: getTechnographics,
    getSessionId: getSessionId,
    getNetworkInfo: getNetworkInfo,
    collect: collect
  };

})();
