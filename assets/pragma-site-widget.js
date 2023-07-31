const SITE_WIDGET_HOST = 'https://logisy.tech';  // Checkout Django page server 'http://192.168.1.164:8000'
const MERCHANT_ID = 410;


function siteWidgetToggled(el) {
  if (el.checked == true){
    initializeSiteWidget();
  };
};

function initializeSiteWidget() {
  var params = {mid: MERCHANT_ID};

  var iframeUrl = new URL(`${SITE_WIDGET_HOST}/site-widget/modal/`);
  Object.keys(params).forEach(key => {
    iframeUrl.searchParams.set(key.toLowerCase(), params[key]);
  });

  // Load only if iframe is not already present
  var iframe = document.querySelector('#siteWidgetContainer iframe');
  if (iframe == null) {
    document.getElementById('siteWidgetContainer').innerHTML += `<iframe src="${iframeUrl.href}" onload="siteWidgetLoaded()" class="d-none"></iframe>`;
  };
};

function siteWidgetLoaded() {
  var iframe = document.querySelector('#siteWidgetContainer iframe');
  iframe.classList.remove('d-none');
  document.querySelector('#siteWidgetContainer .site-widget-loader').remove();
};
