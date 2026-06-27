//+------------------------------------------------------------------+
//|                                                  MT4Bridge.mq4   |
//|        Sends real-time ticks from MetaTrader to your server      |
//+------------------------------------------------------------------+
#property strict
#property show_inputs

extern string ServerURL   = "https://macrosift.site/api/mt4/tick";
extern string AuthToken   = "";
extern int    IntervalSec = 1;

datetime lastSend = 0;

//+------------------------------------------------------------------+
int OnInit() {
   if (!IsDllsAllowed()) {
      Print("ERROR: Enable DLL imports in Tools > Options > Expert Advisors");
      return INIT_FAILED;
   }
   if (StringLen(AuthToken) == 0) {
      Print("WARNING: AuthToken is empty. Set it in EA inputs (TELEGRAM_BOT_TOKEN).");
   }
   Print("MT4Bridge started. Sending ", Symbol(), " to ", ServerURL);
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason) {
   Print("MT4Bridge stopped.");
}

//+------------------------------------------------------------------+
void OnTick() {
   if (TimeCurrent() - lastSend < IntervalSec) return;
   lastSend = TimeCurrent();

   string json = StringFormat("{\"symbol\":\"%s\",\"bid\":%f,\"ask\":%f}", Symbol(), Bid, Ask);
   uchar postData[];
   StringToCharArray(json, postData, 0, StringLen(json));
   ArrayResize(postData, StringLen(json));

   string headers = "Content-Type: application/json\r\n";
   if (StringLen(AuthToken) > 0) {
      headers += StringFormat("Authorization: Bearer %s\r\n", AuthToken);
   }

   uchar result[];
   string respHeaders;
   int res = WebRequest("POST", ServerURL, headers, 2000, postData, result, respHeaders);

   if (res == -1) {
      int err = GetLastError();
      if (err == 4060) {
         Print("ERROR: Add 'macrosift.site' in Tools > Options > Expert Advisors > WebRequest URLs");
      } else {
         Print("ERROR: WebRequest failed. Error ", err);
      }
   }
}
//+------------------------------------------------------------------+
