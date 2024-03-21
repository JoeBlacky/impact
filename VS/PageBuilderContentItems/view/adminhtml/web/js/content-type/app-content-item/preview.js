define([
    'Magento_PageBuilder/js/content-type/preview',
    'Magento_PageBuilder/js/events',
    'knockout'
], function (PreviewBase, _events, ko) {
    'use strict';
    var $super;

    function Preview(parent, config, stageId) {
        PreviewBase.call(this, parent, config, stageId);

        this.componentImageUrl = ko.observable('');
        this.isPlaceholderShown = ko.observable(true);
    }

    Preview.prototype = Object.create(PreviewBase.prototype);
    $super = PreviewBase.prototype;

    Preview.prototype.bindEvents = function bindEvents() {
        $super.bindEvents.call(this);

        this.contentType.dataStore.subscribe( () => {
            this.setImageData();
        });

        _events.on('stage:viewportChangeAfter', () => {
            // in addition to contentType.dataStore.subscribe
            // because dataStore updates before viewport change
            this.setImageData();
        });

        this.contentType.dataStore.subscribe( () => {
            this.isPlaceholderShown(this.isPlaceholderShownCondition());
        });
    }

    Preview.prototype.isPlaceholderShownCondition = function isPlaceholderShownCondition() {
        const dataStore = this.contentType.dataStore.getState();

        return !dataStore.icon && !dataStore.title;
    }

    Preview.prototype.setImageData = function setImageData() {
        const imageData = this.getViewportImageData();

        if (typeof imageData === 'object' && imageData?.url) {
            this.componentImageUrl(imageData.url);
        } else {
            this.componentImageUrl('');
        }
    }

    Preview.prototype.getViewportImageData = function getViewportImageData() {
        const [imageData] = this.contentType.dataStore.getState().image

        return imageData;
    };

    return Preview;
});
