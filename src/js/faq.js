// FAQ accordion (same behaviour as the About page): one question open at a time, click again to close.
$(function () {
  var $list = $(".faq-list");
  if (!$list.length) return;
  function close($item) {
    var $content = $item.find(".faq-content").first();
    $item.removeClass("is-open").attr("aria-expanded", "false");
    $content.css("margin-top", -$content.outerHeight() + "px");
  }
  function open($item) {
    $item.addClass("is-open").attr("aria-expanded", "true");
    $item.find(".faq-content").first().css("margin-top", "0px");
  }
  $list.find(".faq-item").each(function () { close($(this)); });
  setTimeout(function () { $list.addClass("is-ready"); }, 50);
  $list.find(".faq-item").on("click", function (e) {
    if ($(e.target).closest("a").length) return; // let links inside answers work
    var $item = $(this);
    if ($item.hasClass("is-open")) { close($item); return; }
    $list.find(".faq-item.is-open").each(function () { close($(this)); });
    open($item);
  });
  $(window).on("resize", function () {
    $list.find(".faq-item:not(.is-open)").each(function () { close($(this)); });
  });
});
