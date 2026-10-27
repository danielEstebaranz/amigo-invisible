package app.amigoinvisible;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

/** Envuelve la app web de Amigo Invisible en una WebView a pantalla completa. */
public class MainActivity extends Activity {

    private static final String APP_HOST = "amigo-invisible-1w5pe.web.app";
    private static final String APP_URL = "https://" + APP_HOST + "/";

    private WebView webView;
    private View offlineView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout root = new FrameLayout(this);
        webView = new WebView(this);
        offlineView = buildOfflineView();
        offlineView.setVisibility(View.GONE);
        root.addView(webView, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        root.addView(offlineView, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        // En Android 15+ la app se dibuja bajo las barras del sistema: se dejan sus márgenes.
        root.setBackgroundColor(getColor(R.color.background));
        if (android.os.Build.VERSION.SDK_INT >= 30) {
            root.setOnApplyWindowInsetsListener((v, insets) -> {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.ime());
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                return WindowInsets.CONSUMED;
            });
        }

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true); // los perfiles y claves se guardan en localStorage
        s.setDatabaseEnabled(true);
        s.setUserAgentString(s.getUserAgentString() + " AmigoInvisibleApp/1.0");

        webView.addJavascriptInterface(new Bridge(), "AndroidApp");
        webView.setWebChromeClient(new WebChromeClient()); // diálogos confirm() de la web
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (APP_HOST.equals(uri.getHost())) return false;
                // WhatsApp, búsquedas de regalos, etc. se abren fuera de la app.
                openExternal(uri);
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) offlineView.setVisibility(View.VISIBLE);
            }
        });

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(urlFromIntent(getIntent()));
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        webView.loadUrl(urlFromIntent(intent));
    }

    private String urlFromIntent(Intent intent) {
        Uri data = intent != null ? intent.getData() : null;
        if (data != null && APP_HOST.equals(data.getHost())) return data.toString();
        return APP_URL;
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    private void openExternal(Uri uri) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException ignored) {
        }
    }

    private View buildOfflineView() {
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER);
        int pad = (int) (32 * getResources().getDisplayMetrics().density);
        box.setPadding(pad, pad, pad, pad);
        box.setBackgroundColor(getColor(R.color.background));

        TextView title = new TextView(this);
        title.setText(R.string.offline_title);
        title.setTextSize(22);
        title.setGravity(Gravity.CENTER);

        TextView text = new TextView(this);
        text.setText(R.string.offline_text);
        text.setTextSize(15);
        text.setGravity(Gravity.CENTER);
        text.setPadding(0, pad / 3, 0, pad / 2);
        text.setTextColor(Color.GRAY);

        Button retry = new Button(this);
        retry.setText(R.string.retry);
        retry.setOnClickListener(v -> {
            offlineView.setVisibility(View.GONE);
            webView.reload();
        });

        box.addView(title);
        box.addView(text);
        box.addView(retry);
        return box;
    }

    /** Funciones nativas que usa la web cuando se ejecuta dentro de la app. */
    private class Bridge {
        @JavascriptInterface
        public void share(String title, String text) {
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("text/plain");
            send.putExtra(Intent.EXTRA_SUBJECT, title);
            send.putExtra(Intent.EXTRA_TEXT, text);
            runOnUiThread(() -> startActivity(Intent.createChooser(send, title)));
        }

        @JavascriptInterface
        public void copy(String text) {
            android.content.ClipboardManager cm = (android.content.ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
            cm.setPrimaryClip(android.content.ClipData.newPlainText("Amigo Invisible", text));
        }
    }
}
