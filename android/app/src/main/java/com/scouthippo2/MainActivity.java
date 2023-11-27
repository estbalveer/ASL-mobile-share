package com.scouthippo2;

import com.facebook.react.ReactActivity;
import android.content.Intent;
import android.os.Bundle;
 
// import com.emekalites.react.alarm.notification.BundleJSONConverter;
import com.facebook.react.ReactActivity;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.util.Log;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
 
import org.json.JSONObject;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
   public boolean isOnNewIntent = false;

  @Override
  protected String getMainComponentName() {
    return "ScoutHippo";
  }

  @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        isOnNewIntent = true;
        ForegroundEmitter();
        // try {
        //     Bundle bundle = intent.getExtras();
        //     if (bundle != null) {
        //         JSONObject data = BundleJSONConverter.convertToJSON(bundle);
        //         getReactInstanceManager().getCurrentReactContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("OnNotificationOpened", data.toString());
        //     }
        // } catch (Exception e) {
        //     System.err.println("Exception when handling notification opened. " + e);
        // }
    }

    @Override
    protected void onStart() {
        super.onStart();
        if(isOnNewIntent == true){}else {
            ForegroundEmitter();
        }
    }

    public  void  ForegroundEmitter(){
        // this method is to send back data from java to javascript so one can easily
        // know which button from notification or the notification button is clicked
        String  main = getIntent().getStringExtra("mainOnPress");
        String  btn = getIntent().getStringExtra("buttonOnPress");
        WritableMap  map = Arguments.createMap();
        if (main != null) {
            map.putString("main", main);
        }
        if (btn != null) {
            map.putString("button", btn);
        }
        try {
            getReactInstanceManager().getCurrentReactContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("notificationClickHandle", map);
        } catch (Exception  e) {
        Log.e("SuperLog", "Caught Exception: " + e.getMessage());
        }
    }
}
