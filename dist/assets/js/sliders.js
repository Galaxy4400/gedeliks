const markupSliders = () => {
  document.querySelectorAll('[data-slider]').forEach((slider) => {
    if (slider.hasAttribute('data-init')) return;

    const sliderContainer = slider.firstElementChild;
    const sliderItems = Array.from(sliderContainer.children);

    sliderContainer.setAttribute('data-slider-container', '');

    sliderItems.forEach((slide) => slide.setAttribute('data-slider-item', ''));

    slider.setAttribute('data-init', '');
  });
};

//===============================================================

const addTogglePrevNextBtnsActive = (sliderApi, prevBtn, nextBtn) => {
  const togglePrevNextBtnsState = () => {
    if (sliderApi.canScrollPrev()) prevBtn.removeAttribute('disabled');
    else prevBtn.setAttribute('disabled', 'disabled');

    if (sliderApi.canScrollNext()) nextBtn.removeAttribute('disabled');
    else nextBtn.setAttribute('disabled', 'disabled');
  };

  sliderApi
    .on('select', togglePrevNextBtnsState)
    .on('init', togglePrevNextBtnsState)
    .on('reInit', togglePrevNextBtnsState);

  return () => {
    prevBtn.removeAttribute('disabled');
    nextBtn.removeAttribute('disabled');
  };
};

//===============================================================

const addPrevNextBtnsClickHandlers = (sliderApi, sliderKey) => {
  const prevBtn = document.querySelector(`[data-prev="${sliderKey}"]`);
  const nextBtn = document.querySelector(`[data-next="${sliderKey}"]`);

  if (!prevBtn || !nextBtn) return;

  const scrollPrev = () => {
    sliderApi.scrollPrev();
  };
  const scrollNext = () => {
    sliderApi.scrollNext();
  };
  prevBtn.addEventListener('click', scrollPrev, false);
  nextBtn.addEventListener('click', scrollNext, false);

  const removeTogglePrevNextBtnsActive = addTogglePrevNextBtnsActive(sliderApi, prevBtn, nextBtn);

  return () => {
    removeTogglePrevNextBtnsActive();
    prevBtn.removeEventListener('click', scrollPrev, false);
    nextBtn.removeEventListener('click', scrollNext, false);
  };
};

//===============================================================

const addDotBtnsAndClickHandlers = (sliderApi, sliderKey) => {
  const paggination = document.querySelector(`[data-paggination="${sliderKey}"]`);

  if (!paggination) return;

  let dots = [];

  const addDotBtnsWithClickHandlers = () => {
    paggination.innerHTML = sliderApi
      .scrollSnapList()
      .map(
        (_, index) => `<button class="bullet" type="button" aria-label="Move to slide ${index + 1}"></button>`,
      )
      .join('');

    const scrollTo = (index) => {
      sliderApi.scrollTo(index);
    };

    dots = Array.from(paggination.querySelectorAll('button'));
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => scrollTo(index), false);
    });
  };

  const toggleDotBtnsActive = () => {
    const previous = sliderApi.previousScrollSnap();
    const selected = sliderApi.selectedScrollSnap();
    dots[previous].removeAttribute('aria-selected');
    dots[selected].setAttribute('aria-selected', true);
  };

  sliderApi
    .on('init', addDotBtnsWithClickHandlers)
    .on('reInit', addDotBtnsWithClickHandlers)
    .on('init', toggleDotBtnsActive)
    .on('reInit', toggleDotBtnsActive)
    .on('select', toggleDotBtnsActive);

  return () => {
    paggination.innerHTML = '';
  };
};

//===============================================================
const initSlider = (sliderTag, options = {}, plugins = []) => {
  const slider = document.querySelector(`[data-slider="${sliderTag}"]`);

  if (!slider) return;

  const sliderApi = EmblaCarousel(slider, options, plugins);

  const removePrevNextBtnsClickHandlers = addPrevNextBtnsClickHandlers(sliderApi, sliderTag);
  const removeDotBtnsAndClickHandlers = addDotBtnsAndClickHandlers(sliderApi, sliderTag);

  sliderApi.on('destroy', removePrevNextBtnsClickHandlers);
  sliderApi.on('destroy', removeDotBtnsAndClickHandlers);
};

//===============================================================
const initSliders = () => {
  markupSliders();

  initSlider('main', { loop: true }, [EmblaCarouselFade(), EmblaCarouselAutoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]);
	initSlider('news', { loop: false, slidesToScroll: 1 });
	initSlider('prod', { loop: false, slidesToScroll: 1 });
	initSlider('awards', { loop: false, slidesToScroll: 1, align: 'start' });
};

//===============================================================
window.sliders = { init: initSliders };
