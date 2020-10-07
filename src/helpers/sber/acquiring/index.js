import {
  registerURL,
  getOrderStatusURL
} from "./endpoints";

export {
  register,
  getOrderStatus
};

async function register( fetch, options ){
  let URL = registerURL;

  if( "URL" in options ){
    const { URL: URL_ } = options;

    if( typeof URL_ === "string" && URL_ !== "" )
      URL = URL_;

    delete options.URL;
  }

  const params =
    Object.entries( options )
    .map( ( [ key, value ] ) => `${encodeURIComponent( key )}=${encodeURIComponent( value )}` )
    .join( "&" );

  const response = await fetch( URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  } );

  if( !response.ok )
    return { errorCode: "-1", errorMessage: `${response.status} ${response.statusText}` };

  return await response.json();
}

async function getOrderStatus( fetch, options ){
  let URL = getOrderStatusURL;

  if( "URL" in options ){
    const { URL: URL_ } = options;

    if( typeof URL_ === "string" && URL_ !== "" )
      URL = URL_;

    delete options.URL;
  }

  const params =
    Object.entries( options )
    .map( ( [ key, value ] ) => `${encodeURIComponent( key )}=${encodeURIComponent( value )}` )
    .join( "&" );

  const response = await fetch( URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  } );

  if( !response.ok )
    return { ErrorCode: "-1", ErrorMessage: `${response.status} ${response.statusText}` };

  const result = await response.json();

  if( result.ErrorCode === "0" || result.ErrorCode === "2" ){
    if( result.ErrorCode === "2" )
      result.OrderStatus = 7;

    delete result.ErrorCode;
  }

  if( typeof result.OrderStatus === "number" ) switch( result.OrderStatus ){
    case 0: result.OrderStatusMessage = "Заказ зарегистрирован, но не оплачен"; break;
    case 1: result.OrderStatusMessage = "Предавторизованная сумма захолдирована"; break;
    case 2: result.OrderStatusMessage = "Проведена полная авторизация суммы заказа"; break;
    case 3: result.OrderStatusMessage = "Авторизация отменена"; break;
    case 4: result.OrderStatusMessage = "По транзакции была проведена операция возврата"; break;
    case 5: result.OrderStatusMessage = "Инициирована авторизация через ACS банка-эмитента"; break;
    case 6: result.OrderStatusMessage = "Авторизация отклонена"; break;
    case 7: result.OrderStatusMessage = result.ErrorMessage; break;
    default: result.OrderStatusMessage = "Неизвестный статус"; break;
  }

  return result;
}
