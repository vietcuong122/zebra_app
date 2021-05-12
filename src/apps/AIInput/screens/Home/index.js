import React, { useEffect } from 'react';
import { View, Text, DeviceEventEmitter } from 'react-native';
import Container from '../../../../components/Common/Container/index';
import HomeComponent from './components/HomeComponent';
import RNFS from 'react-native-fs';
import moment from 'moment';
import { set } from 'react-native-reanimated';
import DataWedgeIntents from 'react-native-datawedge-intents';
import 'moment/locale/vi';
moment.locale('vi');

const initialForm = {
  userCode: '',
  zone: '',
  alley: '',
  qty: '',
  showQrSection: false,
  editable: true,
};

const initialProduct = {
  barcode: '',
  qty: '',
};

const AIInput = () => {
  const [form, setForm] = React.useState(initialForm);
  const [barcode, setBarcode] = React.useState('');
  const [errors, setErrors] = React.useState({});
  const [content, setContent] = React.useState('');
  const [state, setState] = React.useState({});
  const [quantity, setQuantity] = React.useState('');

  useEffect(() => {
    state.deviceEmitterSubscription = DeviceEventEmitter.addListener(
      'datawedge_broadcast_intent',
      (intent) => {
        broadcastReceiver(intent);
      }
    );
    registerBroadcastReceiver();
    determineVersion();
    return () => {
      state.deviceEmitterSubscription.remove();
    };
  }, []);

  const registerBroadcastReceiver = () => {
    DataWedgeIntents.registerBroadcastReceiver({
      filterActions: [
        'com.zebra.reactnativedemo.ACTION',
        'com.symbol.datawedge.api.RESULT_ACTION',
      ],
      filterCategories: ['android.intent.category.DEFAULT'],
    });
  };

  const determineVersion = () => {
    sendCommand('com.symbol.datawedge.api.GET_VERSION_INFO', '');
  };

  const broadcastReceiver = (intent) => {
    if (
      intent.hasOwnProperty('com.symbol.datawedge.api.RESULT_GET_VERSION_INFO')
    ) {
      //  The version has been returned (DW 6.3 or higher).  Includes the DW version along with other subsystem versions e.g MX
      var versionInfo =
        intent['com.symbol.datawedge.api.RESULT_GET_VERSION_INFO'];
      // console.log('Version Info: ' + JSON.stringify(versionInfo));
      var datawedgeVersion = versionInfo['DATAWEDGE'];

      //  Fire events sequentially so the application can gracefully degrade the functionality available on earlier DW versions
      if (datawedgeVersion >= '6.3') datawedge63();
      if (datawedgeVersion >= '6.4') datawedge64();
      if (datawedgeVersion >= '6.5') datawedge65();
    } else if (!intent.hasOwnProperty('RESULT_INFO')) {
      barcodeScanned(intent, new Date().toLocaleString());
    }
  };

  const datawedge63 = () => {
    // console.log('Datawedge 6.3 APIs are available');
    //  Create a profile for our application
    sendCommand(
      'com.symbol.datawedge.api.CREATE_PROFILE',
      'ZebraReactNativeDemo'
    );

    sendCommand('com.symbol.datawedge.api.GET_ACTIVE_PROFILE', '');

    //  Enumerate the available scanners on the device
    sendCommand('com.symbol.datawedge.api.ENUMERATE_SCANNERS', '');
  };

  const datawedge64 = () => {
    // console.log('Datawedge 6.4 APIs are available');

    //  Documentation states the ability to set a profile config is only available from DW 6.4.
    //  For our purposes, this includes setting the decoders and configuring the associated app / output params of the profile.
    //  Configure the created profile (associated app and keyboard plugin)
    var profileConfig = {
      PROFILE_NAME: 'ZebraReactNativeDemo',
      PROFILE_ENABLED: 'true',
      CONFIG_MODE: 'UPDATE',
      PLUGIN_CONFIG: {
        PLUGIN_NAME: 'BARCODE',
        RESET_CONFIG: 'true',
        PARAM_LIST: {},
      },
      APP_LIST: [
        {
          PACKAGE_NAME: 'com.aiinput',
          ACTIVITY_LIST: ['*'],
        },
      ],
    };
    sendCommand('com.symbol.datawedge.api.SET_CONFIG', profileConfig);

    //  Configure the created profile (intent plugin)
    var profileConfig2 = {
      PROFILE_NAME: 'ZebraReactNativeDemo',
      PROFILE_ENABLED: 'true',
      CONFIG_MODE: 'UPDATE',
      PLUGIN_CONFIG: {
        PLUGIN_NAME: 'INTENT',
        RESET_CONFIG: 'true',
        PARAM_LIST: {
          intent_output_enabled: 'true',
          intent_action: 'com.zebra.reactnativedemo.ACTION',
          intent_delivery: '2',
        },
      },
    };
    sendCommand('com.symbol.datawedge.api.SET_CONFIG', profileConfig2);

    //  Give some time for the profile to settle then query its value
    setTimeout(() => {
      sendCommand('com.symbol.datawedge.api.GET_ACTIVE_PROFILE', '');
    }, 1000);
  };

  const datawedge65 = () => {
    // console.log('Datawedge 6.5 APIs are available');
  };

  const sendCommand = (extraName, extraValue) => {
    // console.log(
    //   'Sending Command: ' + extraName + ', ' + JSON.stringify(extraValue)
    // );
    var broadcastExtras = {};
    broadcastExtras[extraName] = extraValue;
    DataWedgeIntents.sendBroadcastWithExtras({
      action: 'com.symbol.datawedge.api.ACTION',
      extras: broadcastExtras,
    });
  };

  const barcodeScanned = (scanData, timeOfScan) => {
    console.log('call barcodeScanned');
    var scannedData = scanData['com.symbol.datawedge.data_string'];
    var scannedType = scanData['com.symbol.datawedge.label_type'];
    if (scannedData) {
      console.log(`scannedData`, scannedData);
      setBarcode(scannedData);
    }
  };

  const onChange = ({ name, value }) => {
    console.log(`form on change`, name, value);
    switch (name) {
      case 'barcode':
        setBarcode(value);
        break;
      case 'quantity':
        setQuantity(value);
        break;
      default:
        form[name] = value;
        setForm(form);
        break;
    }
    // if (name === 'barcode') {
    //   console.log('call change barcode');
    //   setBarcode(value);
    //   //setQuantity('');
    // } else if (name === 'quantity') {
    //   setQuantity(value);
    // } else {
    //   form[name] = value;
    //   setForm(form);
    // }
    if (value !== '') {
      setErrors((pre) => {
        return { ...pre, [name]: null };
      });
    } else {
      setErrors((pre) => {
        return { ...pre, [name]: 'This field is required' };
      });
    }
  };

  const onSubmit = () => {
    if (!form.userCode) {
      setErrors((pre) => {
        return { ...pre, userCode: 'Please input user code' };
      });
    }
    if (!form.zone) {
      setErrors((pre) => {
        return { ...pre, zone: 'Please input zone' };
      });
    }
    if (!form.alley) {
      setErrors((pre) => {
        return { ...pre, alley: 'Please input alley' };
      });
    }
    if (form.userCode && form.zone && form.alley)
      setForm({ ...form, editable: false, showQrSection: true });
  };

  const onSave = async () => {
    if (!barcode) {
      setErrors((pre) => {
        return { ...pre, barcode: 'Please input barcode' };
      });
    }
    if (!quantity) {
      setErrors((pre) => {
        return { ...pre, quantity: 'Please input quantity' };
      });
    }
    if (barcode && quantity) {
      await writeFile();
      setQuantity('');
      setBarcode('');
    }
  };

  const onStop = () => {
    setForm(initialForm);
    setQuantity('');
    setErrors({});
    setBarcode('');
  };

  const writeFile = async () => {
    const filePath = `file://${
      RNFS.ExternalStorageDirectoryPath
    }/AI-${form.userCode.toUpperCase()}-${form.zone.toUpperCase()}.txt`;
    const res = await RNFS.readFile(filePath, 'utf8')
      .then((result) => result)
      .catch((err) => null);
    let fileContent;
    const currentTime = moment().format('YYYY/MM/DD,HH:mm:ss');
    console.log(`currentTime`, currentTime);
    console.log(`res`, res);
    if (res) {
      fileContent = `${res}\nARTICLE,${barcode},${quantity}`;
    } else {
      fileContent = `NHAN VIEN,${form.userCode.toUpperCase()},${currentTime}\nADRESSE,${form.zone.toUpperCase()},${form.alley.toUpperCase()}\nARTICLE,${barcode},${quantity}`;
    }

    RNFS.writeFile(filePath, fileContent, 'utf8')
      .then((res) => {
        console.log('File witted');
      })
      .catch((err) => {
        console.log(err);
      });
    // RNFS
  };
  return (
    <HomeComponent
      onChange={onChange}
      onSubmit={onSubmit}
      onSave={onSave}
      onStop={onStop}
      form={form}
      errors={errors}
      barcode={barcode}
      quantity={quantity}
    />
  );
};

export default AIInput;
