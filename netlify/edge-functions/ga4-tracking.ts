import type { Config, Context } from "@netlify/edge-functions";

const MEASUREMENT_ID = "G-KEPF58FKCS";

const analyticsMarkup = `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${MEASUREMENT_ID}');

  (function () {
    function send(name, params) {
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, params || {});
      }
    }

    document.addEventListener('click', function (event) {
      var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
      if (!link) return;

      var href = link.href || '';
      var label = (link.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 100);

      if (href.indexOf('tel:') === 0) {
        send('phone_call_click', { link_text: label });
        send('contact_intent', { contact_method: 'phone', link_text: label });
      } else if (href.indexOf('mailto:') === 0) {
        send('email_click', { link_text: label });
        send('contact_intent', { contact_method: 'email', link_text: label });
      } else if (
        /demo/i.test(label) ||
        /aiflowdeskpro\\.com/i.test(href) ||
        /auto-attendant\\.aiflowdeskpro\\.com/i.test(href) ||
        /lead-management\\.aiflowdeskpro\\.com/i.test(href)
      ) {
        send('product_demo_click', {
          link_text: label,
          link_url: href
        });
        send('contact_intent', {
          intent: 'product_demo',
          link_text: label,
          link_url: href
        });
      }
    }, true);

    document.addEventListener('submit', function (event) {
      var form = event.target;
      if (!form || !form.id) return;

      if (['contact-form', 'consultation-form', 'startup-consultation-form'].indexOf(form.id) !== -1) {
        send('contact_intent', {
          intent: 'form_submit',
          form_id: form.id,
          page_location: window.location.href
        });
      } else if (form.id === 'payrollDemoForm') {
        send('demo_completed', {
          demo_name: 'payroll_calculator'
        });
      }
    }, true);
  })();
</script>
`;

export default async (request: Request, context: Context) => {
  if (request.method !== "GET") return context.next();

  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  if (html.includes(MEASUREMENT_ID)) {
    return new Response(html, response);
  }

  const injected = html.includes("</head>")
    ? html.replace("</head>", analyticsMarkup + "\n</head>")
    : analyticsMarkup + "\n" + html;

  const headers = new Headers(response.headers);
  headers.delete("content-length");

  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const config: Config = {
  path: "/*",
  excludedPath: ["/api/*", "/.netlify/*"],
  onError: "bypass",
};
