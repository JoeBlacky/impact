define([
    'fancyboxConfig'
], function (fancyboxConfig) {
    return async function (config, element) {
        const { Carousel } = await import(fancyboxConfig.Carousel);
        let plugins = {};

        const $carousel = element.find('[data-element=slider]');

        if (!$carousel.length) return;

        const $carouselData = $carousel.data();

        const options = {
            autoplay: $carouselData.sliderAutoplay,
            autoplaySpeed: $carouselData.sliderAutoplaySpeed || 3000,
            infinite: $carouselData.sliderInfinite,
            centerSlides: $carouselData.sliderCenterSlides,
            showArrows: $carouselData.sliderShowArrows,
            showDots: $carouselData.sliderShowDots,
            dotsType: $carouselData.sliderDotsType || 'classic',
            showThumbs: $carouselData.sliderShowThumbs || false,
            thumbsType: $carouselData.sliderThumbsType || 'classic'
        };

        let sliderConfig = {
            classes: {
                slide: $carousel?.children()[0]?.classList[0] || 'f-carousel__slide'
            },
            infinite: options.infinite,
            center: options.centerSlides,
            on: {
                ready: function (instance) {
                    instance.container.classList.add('is-loaded');
                }
            },
            Navigation: false,
            Dots: false
        }

        if (options.autoplay) {
            const { Autoplay } = await import(fancyboxConfig.Autoplay);
            plugins = { ...plugins, Autoplay };

            sliderConfig.Autoplay = {
                timeout: parseInt(options.autoplaySpeed)
            };
        }

        if (options.showArrows) {
            sliderConfig.Navigation = {
                classes: {
                    container: "f-carousel__nav"
                }
            }
        }

        if (options.showThumbs) {
            const { Thumbs } = await import(fancyboxConfig.Thumbs);
            plugins = { ...plugins, Thumbs };

            sliderConfig.Thumbs = {
                type: options.thumbsType
            }
        }

        if (options.showDots) {
            sliderConfig.Dots = {
                dynamicFrom: options.dotsType === 'dynamic' ? 2 : 5
            }
        }

        new Carousel(
            $carousel[0],
            sliderConfig,
            plugins
        );
    }
});
