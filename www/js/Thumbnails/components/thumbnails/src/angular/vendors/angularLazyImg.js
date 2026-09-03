import angular from "angular";

/*
 * angular-lazy-load
 *
 * Copyright(c) 2014 Paweł Wszoła <wszola.p@gmail.com>
 * MIT Licensed
 *
 */

/**
 * @author Paweł Wszoła (wszola.p@gmail.com)
 *
 */

angular.module('angularLazyImg', [])
    .factory('LazyImgMagic', [
        '$window', '$rootScope', 'lazyImgConfig', 'lazyImgHelpers',
        function ($window, $rootScope, lazyImgConfig, lazyImgHelpers) {
            

            let winDimensions; let $win; let images; let isListening; let options;
            let checkImagesT; let saveWinOffsetT; let containers;

            images = [];
            isListening = false;
            options = lazyImgConfig.getOptions();
            $win = angular.element($window);
            winDimensions = lazyImgHelpers.getWinDimensions();
            saveWinOffsetT = lazyImgHelpers.throttle(() => {
                winDimensions = lazyImgHelpers.getWinDimensions();
            }, 60);
            containers = [options.container || $win];

            function checkImages() {
                for (let i = images.length - 1; i >= 0; i--) {
                    const image = images[i];
                    if (image && lazyImgHelpers.isElementInView(image.$elem[0], options.offset, winDimensions)) {
                        loadImage(image);
                        images.splice(i, 1);
                    }
                }
                if (images.length === 0) { stopListening(); }
            }

            checkImagesT = lazyImgHelpers.throttle(checkImages, 30);

            function listen(param) {
                containers.forEach((container) => {
                    container[param]('scroll', checkImagesT);
                    container[param]('touchmove', checkImagesT);
                });
                $win[param]('resize', checkImagesT);
                $win[param]('resize', saveWinOffsetT);
            }

            function startListening() {
                isListening = true;
                setTimeout(() => {
                    checkImages();
                    listen('on');
                }, 1);
            }

            function stopListening() {
                isListening = false;
                listen('off');
            }

            function removeImage(image) {
                const index = images.indexOf(image);
                if (index !== -1) {
                    images.splice(index, 1);
                }
            }

            function loadImage(photo) {
                const img = new Image();
                img.onerror = function () {
                    if (options.errorClass) {
                        photo.$elem.addClass(options.errorClass);
                    }
                    $rootScope.$emit('lazyImg:error', photo);
                    options.onError(photo);
                };
                img.onload = function () {
                    setPhotoSrc(photo.$elem, photo.src);
                    photo.$elem.removeClass(options.loadingClass);
                    if (options.successClass) {
                        photo.$elem.addClass(options.successClass);
                    }
                    $rootScope.$emit('lazyImg:success', photo);
                    options.onSuccess(photo);
                };
                img.src = photo.src;
            }

            function setPhotoSrc($elem, src) {
                if ($elem[0].nodeName.toLowerCase() === 'img') {
                    $elem[0].src = src;
                } else {
                    $elem.css('background-image', `url("${  src  }")`);
                }
            }

            // PHOTO
            function Photo($elem) {
                $elem.addClass(options.loadingClass);
                this.$elem = $elem;
            }

            Photo.prototype.setSource = function (source) {
                this.src = source;
                images.unshift(this);
                if (!isListening) { startListening(); }
            };

            Photo.prototype.removeImage = function () {
                removeImage(this);
                if (images.length === 0) { stopListening(); }
            };

            Photo.prototype.checkImages = function () {
                checkImages();
            };

            Photo.addContainer = function (container) {
                stopListening();
                containers.push(container);
                startListening();
            };

            Photo.removeContainer = function (container) {
                stopListening();
                containers.splice(containers.indexOf(container), 1);
                startListening();
            };

            return Photo;

        }
    ]).provider('lazyImgConfig', function () {
        

        this.options = {
            offset: 100,
            errorClass: null,
            successClass: null,
            onError () { },
            onSuccess () { },
            loadingClass: "icon-placeholder-game"
        };

        this.$get = function () {
            const {options} = this;
            return {
                getOptions () {
                    return options;
                }
            };
        };

        this.setOptions = function (options) {
            angular.extend(this.options, options);
        };
    }).factory('lazyImgHelpers', [
        '$window', function ($window) {
            

            function getWinDimensions() {
                return {
                    height: $window.innerHeight,
                    width: $window.innerWidth
                };
            }

            function isElementInView(elem, offset, winDimensions) {
                const rect = elem.getBoundingClientRect();
                const bottomline = winDimensions.height + offset;
                return elem.offsetParent && (
                    rect.left >= 0 && rect.right <= winDimensions.width + offset && (
                        rect.top >= 0 && rect.top <= bottomline ||
                        rect.bottom <= bottomline && rect.bottom >= 0 - offset
                    )
                );
            }

            // http://remysharp.com/2010/07/21/throttling-function-calls/
            function throttle(fn, threshhold, scope) {
                let last; let deferTimer;
                return function () {
                    const context = scope || this;
                    const now = +new Date();
                        const args = arguments;
                    if (last && now < last + threshhold) {
                        clearTimeout(deferTimer);
                        deferTimer = setTimeout(() => {
                            last = now;
                            fn.apply(context, args);
                        }, threshhold);
                    } else {
                        last = now;
                        fn.apply(context, args);
                    }
                };
            }

            return {
                isElementInView,
                getWinDimensions,
                throttle
            };

        }
    ]).directive('lazyImg', [
        '$rootScope', 'LazyImgMagic', function ($rootScope, LazyImgMagic) {
            

            function link(scope, element, attributes) {
                const lazyImage = new LazyImgMagic(element);
                attributes.$observe('lazyImg', (newSource) => {
                    if (newSource) {
                        // in angular 1.3 it might be nice to remove observer here
                        lazyImage.setSource(newSource);
                    }
                });
                scope.$on('$destroy', () => {
                    lazyImage.removeImage();
                });
                $rootScope.$on('lazyImg.runCheck', () => {
                    lazyImage.checkImages();
                });
                $rootScope.$on('lazyImg:refresh', () => {
                    lazyImage.checkImages();
                });
            }

            return {
                link,
                restrict: 'A'
            };
        }
    ]).directive('lazyImgContainer', [
        'LazyImgMagic', function (LazyImgMagic) {
            

            function link(scope, element) {
                LazyImgMagic.addContainer(element);
                scope.$on('$destroy', () => {
                    LazyImgMagic.removeContainer(element);
                });
            }

            return {
                link,
                restrict: 'A'
            };
        }
    ]);
