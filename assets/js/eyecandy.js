gsap.registerPlugin(ScrollTrigger, SplitText);

const toMilliseconds = (v) => (v.endsWith('s') ? parseFloat(v) * 1000 : parseFloat(v));

const ecFunkyDance = (ele) => {

  ele.style.willChange = 'transform, opacity';
  ele.parentElement.style.overflow = 'hidden';

  SplitText.create(ele, {
    type: 'chars, words, lines',
    
    autoSplit: true,
    onSplit(self) {
      return gsap.from(self.chars, {
        duration: Math.random() * 0.5,
        yPercent: 'random([-10, 10])',
        scale: 'random(0.8, 1.2)',
        ease: 'back.out(1.2)',
        autoAlpha: 0,
        scrollTrigger: {
          trigger: ele,
          start: 'top 80%',
          toggleActions: 'play reverse restart reverse',
        },
        stagger: {
          amount: 0.3,
          duration: 0.5 + Math.random() * 0.5,
          from: 'center',
        },
      });
    },
  });
};

const ecImageFadeIn = (image) => {
  ScrollTrigger.create({
    trigger: image,
    start: 'top 80%',
    onEnter: () => {
      gsap.fromTo(
        image,
        { opacity: 0, scale: 0.2 },
        { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' },
      );
    },
    onEnterBack: () => {
      gsap.fromTo(
        image,
        { opacity: 0, scale: 0.2 },
        { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' },
      );
    }
  });
};

const ecSlideInChars = (ele) => {
  SplitText.create(ele, {
    type: 'chars, words, lines',

    autoSplit: true,
    onSplit(self) {
      return gsap.from(self.chars, {
        duration: 0.5 + Math.random() * 0.5,
        xPercent: -200, //'random([-200, -90])',
        ease: 'back.out(1.7)',
        autoAlpha: 0,
        scrollTrigger: {
          trigger: ele,
          start: 'top 80%',
          toggleActions: 'play reverse restart reverse',
        },
        stagger: {
          amount: 0.3,
          duration: 0.5 + Math.random() * 0.5,
          from: 'center',
        },
      });
    },
  });
};

const ecZoomIn = (el) => {
  gsap.from(el, {
    duration: 0.5 + Math.random() * 0.5,
    scale: 10.5 + Math.random() * 0.5,
    ease: 'sine.in(1.7)',
    mask: 'lines',
    xPercent: 200,
    autoAlpha: 0,
    scrollTrigger: {
      trigger: el,
      start: 'top 80%',
      toggleActions: 'play reverse restart reverse',
    },
  });
};

const ecSlideIn = (el, delay) => {
  gsap.from(el, {
    duration: 0.5 + Math.random() * 0.5,
    xPercent: -100,
    ease: 'sine.in(1.7)',
    autoAlpha: 0,
    scrollTrigger: {
      trigger: el,
      start: 'top 80%',
      toggleActions: 'play reverse restart reverse',
      delay: toMilliseconds(delay),
    },
  });
};

const ecRotateIn = (el, delay) => {
  gsap.from(el, {
    duration: 0.3 + Math.random() * 0.2,
    rotationY: 90,
    width: 0,
    ease: 'sine.in(1.7)',
    autoAlpha: 0,
    scrollTrigger: {
      trigger: el,
      start: 'top 80%',
      toggleActions: 'play reverse restart reverse',
      delay: toMilliseconds(delay),
    },
  });
};

const ecMoveIn = (el, delay) => {
  // return;
  gsap.from(el, {
    duration: 0.2 + Math.random() * 0.5,
    yPercent: 25,
    ease: 'sine.in(1.7)',
    scrollTrigger: {
      trigger: el,
      start: 'top 100%',
      toggleActions: 'play pause none none',
      delay: toMilliseconds(delay),
    },
  });
};

const ecFadeIn = (el, delay) => {
  gsap.from(el, {
    duration: 0.5 + Math.random() * 0.5,
    autoAlpha: 0,
    scale: 0.8,
    ease: 'sine.in(1.7)',
    scrollTrigger: {
      trigger: el,
      start: 'top 80%',
      toggleActions: 'play none none none',
      delay: toMilliseconds(delay),
    },
  });
};

const animateLines = (text) => {
  text.querySelectorAll('*').forEach((el) => {
    SplitText.create(el, {
      type: 'chars, words, lines',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          duration: 0.5 + Math.random() * 0.5,
          yPercent: 'random([90, 100])',
          ease: 'sine.in(1.7)',

          autoAlpha: 0,
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play reverse restart reverse',
          },
          stagger: {
            amount: 0.0,
            duration: 0.5 + Math.random() * 0.5,
            from: 'center',
          },
        });
      },
    });
  });
};

const initEyeCandy = () => {

  const fontsReady =
    'fonts' in document && document.fonts?.ready ? document.fonts.ready : Promise.resolve(); // Fallback, falls Font Loading API nicht da ist

  fontsReady.then(() => {
    const funkyDanceElements = document.querySelectorAll('[data-eyecandy="funky-dance"]');
    if (funkyDanceElements.length) {
      funkyDanceElements.forEach((el) => ecFunkyDance(el));
    }

    const slideInCharsElements = document.querySelectorAll('[data-eyecandy="slide-in-chars"]');
    if (slideInCharsElements.length) {
      slideInCharsElements.forEach((el) => ecSlideInChars(el));
    }

    const zoomInElements = document.querySelectorAll('[data-eyecandy="zoom-in"]');
    if (zoomInElements.length) {
      zoomInElements.forEach((el) => ecZoomIn(el));
    }

    const slideInElements = document.querySelectorAll('[data-eyecandy="slide-in"]');
    if (slideInElements.length) {
      slideInElements.forEach((el) => {
        const delay = el.dataset.eyecandyDelay || '0s';
        ecSlideIn(el, delay);
      });
    }

    const moveInElements = document.querySelectorAll('[data-eyecandy="move-in"]');
    if (moveInElements.length) {
      moveInElements.forEach((el) => {
        const delay = el.dataset.eyecandyDelay || '0s';
        ecMoveIn(el, delay);
      });
    }

    const animateChildElements = document.querySelectorAll('[data-eyecandy="animate-childs"] > *');
    if (animateChildElements.length) {
      animateChildElements.forEach((el) => {
        const delay = el.dataset.eyecandyDelay || '0s';
        ecMoveIn(el, delay);
      });
    }

    const fadeInElements = document.querySelectorAll('[data-eyecandy="fade-in"]');
    if (fadeInElements.length) {
      fadeInElements.forEach((el) => {
        const delay = el.dataset.eyecandyDelay || '0s';
        ecFadeIn(el, delay);
      });
    }

    const rotateInElements = document.querySelectorAll('[data-eyecandy="rotate-in"]');
    if (rotateInElements.length) {
      rotateInElements.forEach((el) => {
        const delay = el.dataset.eyecandyDelay || '0s';
        ecRotateIn(el, delay);
      });
    }

    const imageFadeInElements = document.querySelectorAll('[data-eyecandy="image-fade-in"]');
    if (imageFadeInElements.length) {
      imageFadeInElements.forEach((el) => {
        const delay = el.dataset.eyecandyDelay || '0s';
        ecImageFadeIn(el, delay);
      });
    }

    const heroText = document.querySelector('.hero-text');
    if (heroText) animateLines(heroText);
  });
};

const addChoreography = () => {
  const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  const home = document.querySelector('[data-layout="home"]');

  if (home !== null) {
    home.querySelectorAll('h1').forEach((ele) => { ele.dataset.eyecandy = 'funky-dance'; });
    home.querySelectorAll('.content img').forEach((ele) => { ele.dataset.eyecandy = 'image-fade-in'; });

  }

  if (width < 768) return;

  if (home !== null) {
    home.querySelectorAll('h2, h3').forEach((ele) => { ele.dataset.eyecandy = 'fade-in'; });
  };
};

/* Main
############################################################################ */

document.addEventListener('DOMContentLoaded', () => {
  addChoreography();
  initEyeCandy();
});



/*

const ecFunkyDanceOld = (ele) => {
  ele.querySelectorAll('h1, h2, h3').forEach((el) => {
    SplitText.create(el, {
      type: 'chars, words, lines',

      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.chars, {
          duration: 1.5 + Math.random() * 0.5,
          yPercent: 'random([-100, 100])',
          scale: 'random(0.5, 9.5)',
          ease: 'back.out(1.7)',
          autoAlpha: 0,
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play reverse restart reverse',
          },
          stagger: {
            amount: 0.3,
            duration: 0.5 + Math.random() * 0.5,
            from: 'center',
          },
        });
      },
    });
  });
};

    gsap.utils.toArray('.content img').forEach((image) => {
      ScrollTrigger.create({
        trigger: image,
        start: 'top 80%',
        onEnter: () => {
          gsap.fromTo(
            image,
            { opacity: 0, scale: 1 },
            { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' },
          );
        },
        onEnterBack: () => {
          gsap.fromTo(
            image,
            { opacity: 0, scale: 1.1 },
            { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' },
          );
        },
        onLeave: () => gsap.set(image, { opacity: 0, scale: 1.1 }),
        onLeaveBack: () => gsap.set(image, { opacity: 0, scale: 1.1 }),
      });
    });
  });

*/
