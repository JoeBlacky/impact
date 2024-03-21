define([
    'VS_PageBuilderSlider/js/common/dynamic-collection/preview',
    'jquery',
    'underscore',
    'fancyboxConfig',
    "Magento_PageBuilder/js/events",
    'Magento_PageBuilder/js/config',
    'Magento_PageBuilder/js/content-type-menu/option'
], function (PreviewBase, $, _, fancyboxConfig, events, config, option) {
    'use strict';

    var $super;

    function Preview(parent, config, stageId) {
        PreviewBase.call(this, parent, config, stageId);
    }

    Preview.prototype = Object.create(PreviewBase.prototype);
    $super = PreviewBase.prototype;

    Preview.prototype.element = null;
    Preview.prototype.carousel = null;
    Preview.prototype.carouselOptions = {};
    Preview.prototype.carouselPlugins = {};

    Preview.prototype.bindEvents = function bindEvents() {
        $super.bindEvents.call(this);

        this.contentType.dataStore.subscribe( () => {
            this.setGalleryOptions();
            this.reInitCarousel();
        });

        this.contentType.children.subscribe( _.debounce(() => {
            this.destroyCarousel();
            this.handleGallery();
        }, 300));

        events.on(`${this.childContentType}:removeAfter`, (args) => {
            if (args.parentContentType && args.parentContentType.id === this.contentType.id) {
                this.removeSlide(args.index);
            }
        });
    }

    Preview.prototype.setGalleryOptions = async function () {
        this.carouselOptions = {};
        this.carouselPlugins = {};

        const dataStore = this.contentType.dataStore.getState();
        const options = {
            autoplay: dataStore.autoplay,
            autoplaySpeed: dataStore.autoplay_speed || 3000,
            centerSlides: dataStore.center_slides,
            showArrows: dataStore.show_arrows,
            showDots: dataStore.show_dots,
            dotsType: dataStore.dots_type || 'classic',
            showThumbs: dataStore.show_thumbs,
            thumbsType: dataStore.thumbs_type || 'classic',
        };

        this.carouselOptions = {
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

        if (options.autoplay === 'true') {
            const { Autoplay } = await import(fancyboxConfig.Autoplay);
            this.carouselPlugins = { ...this.carouselPlugins, Autoplay };

            this.carouselOptions.Autoplay = {
                timeout: parseInt(options.autoplaySpeed)
            };
        }

        if (options.showArrows === 'true') {
            this.carouselOptions.Navigation = {
                classes: {
                    container: "f-carousel__nav"
                }
            }
        }

        if (options.showThumbs === 'true') {
            const { Thumbs } = await import(fancyboxConfig.Thumbs);
            this.carouselPlugins = { ...this.carouselPlugins, Thumbs };

            this.carouselOptions.Thumbs = {
                type: options.thumbsType
            }
        }

        if (options.showDots === 'true') {
            this.carouselOptions.Dots = {
                minCount: 2,
                dynamicFrom: options.dotsType === 'dynamic' ? 1 : false
            }
        }
    }

    Preview.prototype.handleGallery = function () {
        if (this.element) {
            if ($(this.element).hasClass('is-loaded')) {
                this.carousel.reInit();
            } else {
                this.initCarousel();
            }
        }
    }

    Preview.prototype.afterRender = function (element) {
        this.element = element;

        this.handleGallery();
    };

    Preview.prototype.addItem = function addItem() {
        this.destroyCarousel();

        $super.addItem.call(this);
    };

    Preview.prototype.removeSlide = function (index) {
        if (this.carousel) {
            this.carousel.removeSlide(index)
        }
    };

    Preview.prototype.destroyCarousel = function () {
        if (this.carousel) {
            this.carousel.destroy();
            $(this.element).removeClass('is-loaded');
        }
    };

    Preview.prototype.reInitCarousel = async function () {
        if (this.carousel) {
            await this.setGalleryOptions();
            this.carousel.reInit(this.carouselOptions, this.carouselPlugins);
        }
    }

    Preview.prototype.initCarousel = async function () {
        const { Carousel } = await import(fancyboxConfig.Carousel);

        this.carousel = new Carousel(
            this.element,
            this.carouselOptions,
            this.carouselPlugins
        );
    }

    return Preview;
});
