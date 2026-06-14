import requests
import time
import os
import json
from concurrent.futures import ThreadPoolExecutor

BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
BASE_URL = os.environ.get("TICK_SIMULATOR_BASE_URL", "http://app:3000")
TWELVE_KEY = os.environ.get("TWELVE_DATA_API_KEY", "")

SYMBOLS = {
    "forex": ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD"],
    "crypto": ["BTC", "ETH", "SOL", "XRP", "ADA", "DOGE"],
    "metals": ["XAUUSD", "XAGUSD"],
}

HEADERS = {
    "Authorization": f"Bearer {BOT_TOKEN}",
    "Content-Type": "application/json",
}

def send_tick(symbol, bid, ask):
    key = symbol.replace("/", "")
    payload = {"symbol": key, "bid": bid, "ask": ask, "volume": 0}
    try:
        r = requests.post(f"{BASE_URL}/api/mt4/tick", json=payload, headers=HEADERS, timeout=5)
        return r.ok
    except:
        return False

def fetch_forex():
    try:
        r = requests.get("https://api.frankfurter.app/latest?from=USD", timeout=10)
        data = r.json()
        rates = data.get("rates", {})
        direct = {"USD/JPY": "JPY", "USD/CHF": "CHF", "USD/CAD": "CAD"}
        indirect = {"EUR/USD": "EUR", "GBP/USD": "GBP", "AUD/USD": "AUD"}
        for sym, code in direct.items():
            key = sym.replace("/", "")
            if code in rates:
                p = float(rates[code])
                spread = p * 0.00015
                send_tick(key, p - spread / 2, p + spread / 2)
        for sym, code in indirect.items():
            key = sym.replace("/", "")
            if code in rates:
                p = 1.0 / float(rates[code])
                spread = p * 0.00015
                send_tick(key, p - spread / 2, p + spread / 2)
    except Exception as e:
        pass

def fetch_crypto():
    for sym in SYMBOLS["crypto"]:
        try:
            usdt = "USDT" if sym != "USDC" else "USD"
            r = requests.get(
                f"https://api.binance.com/api/v3/ticker/price?symbol={sym}{usdt}",
                timeout=5,
            )
            data = r.json()
            if "price" in data:
                p = float(data["price"])
                spread = p * 0.001
                send_tick(sym, p - spread / 2, p + spread / 2)
        except:
            pass

METAL_KEYS = {"XAUUSD": "gold", "XAGUSD": "silver", "XPTUSD": "platinum", "XPDUSD": "palladium"}

def fetch_metals():
    try:
        r = requests.get(
            "https://mintedmetal.com/api/prices.json",
            timeout=10,
            headers={"User-Agent": "MacroSift/1.0"},
        )
        data = r.json()
        for sym, key in METAL_KEYS.items():
            m = data.get("metals", {}).get(key, {})
            p = float(m.get("price", 0))
            if p:
                spread = p * 0.0002 if "XAU" in sym else 0.0003
                send_tick(sym, p - spread / 2, p + spread / 2)
    except:
        pass

def main():
    print("Tick simulator started")
    while True:
        with ThreadPoolExecutor(max_workers=3) as ex:
            ex.submit(fetch_forex)
            ex.submit(fetch_crypto)
            ex.submit(fetch_metals)
        time.sleep(5)

if __name__ == "__main__":
    main()
