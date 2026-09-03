import $ from 'jquery';
import { addLegacyExternal } from '@rbx/externals';
import linkify from './src/lib/linkify';

addLegacyExternal(['Roblox', 'Linkify'], linkify);

// Allow .linkify() to be called on jQuery elements
$.fn.linkify = function linkifyFunc() {
  return this.each(function linkifyFunc() {
    const element = $(this);
    const html = element.html();
    if (typeof html !== 'undefined' && html !== null) {
      const newHtml = linkify.String(html);
      element.html(newHtml);
    }
  });
};

// Linkify all tags with 'linkify' class on document ready
$(() => {
  $('.linkify').linkify();
});
