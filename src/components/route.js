



function OnResize(event) {
    console.log('OnResize', event);
}
function OnResizeEnd(event) {
    console.log('OnResizeEnd', event);
    console.log('I\'ve been resized 100ms ago! — ' + new Date() );

    var DOMcontent = document.getElementById('content');

    var contentHeight = DOMcontent.offsetHeight;

    console.log('container size', contentHeight);

}


// window.addEventListener('resize', function(event) {
//     OnResize(event);
// });

window.addEventListener('resize-end', function(event) {
    OnResizeEnd(event);
});


window.addEventListener('DOMContentLoaded', function() {
  var resizeEnd;
  window.addEventListener('resize', function() {
    console.log('fired');
    clearTimeout(resizeEnd);
    resizeEnd = setTimeout(function() {
      // option 1
      var evt = new Event('resize-end');
      window.dispatchEvent(evt);
      // option 2: old-fashioned
      /*var evt = document.createEvent('Event');
      evt.initEvent('resize-end', true, true);
      window.dispatchEvent(evt);*/
    }, 100);
  });
});