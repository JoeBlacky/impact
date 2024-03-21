define([
    'jquery',
    'Magento_PageBuilder/js/events',
    'Magento_PageBuilder/js/content-type/preview-collection',
    'Magento_PageBuilder/js/config',
    'Magento_PageBuilder/js/content-type-factory',
    'Magento_PageBuilder/js/content-type-menu/option'
], function ($, events, PreviewCollection, _config, contentTypeFactory, option) {
    'use strict';

    let $super;

    function Preview(parent, config, stageId) {
        PreviewCollection.call(this, parent, config, stageId);
    }

    Preview.prototype.childContentType = null;

    Preview.prototype = Object.create(PreviewCollection.prototype);
    $super = PreviewCollection.prototype;

    Preview.prototype.retrieveOptions = function retrieveOptions() {
        let options = $super.retrieveOptions.call(this, arguments);

        options.add = new option({
            preview: this,
            icon: '<i class=\'icon-pagebuilder-add\'></i>',
            title: 'Add Item',
            action: this.addItem,
            classes: ['add-child'],
            sort: 10
        });

        return options;
    };

    Preview.prototype.bindEvents = function bindEvents() {
        $super.bindEvents.call(this);

        if (!this.childContentType) {
            const name = this.contentType.config.name;

            this.childContentType = name.substring(0, name.lastIndexOf('-')); // It may be somewhere in config but I didn't found it
        }

        events.on(`${this.contentType.config.name}:dropAfter`, (args) => {
            if (args.id === this.contentType.id && this.contentType.children().length === 0) {
                this.addItem();
            }
        });

        this.contentType.children.subscribe( () => {
            let sortableElement = $(this.wrapperElement).find('.sortable-container');

            if (!sortableElement.data('ui-sortable')) {
                return;
            }

            if (this.contentType.children().length <= 1) {
                sortableElement.sortable('disable');
            } else {
                sortableElement.sortable('enable');
            }
        });
    }

    Preview.prototype.addItem = function addItem(index = 0) {
        var createChildItemPromise = contentTypeFactory(
            _config.getContentTypeConfig(this.childContentType),
            this.contentType,
            this.contentType.stageId,
            {}
        );

        createChildItemPromise.then( (item) => {
            this.contentType.addChild(item, index);

            return item;
        }).catch(function (error) {
            console.error(error);
        });
    };

    return Preview;
});
