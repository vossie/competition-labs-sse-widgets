# SSE - a simple SSE integration using `EventSource`


Allows the user to connect to an SSE channel and run custom triggers based on the response.

This library can be used with any JavaScript project as this is built in [Vanilla JS](http://vanilla-js.com/)

### Usage:

```
	new sseMessaging({
        sseUrl: "/sse-events",
        callback: function(data){
          //your callback code goes here
          console.log(data);
        }
	});
```

### Options (Settings):
```
  {
     ajax: {
        url: "/your-ajax-call",
        apiKey: {"API-KEY": "your-key"},
        errorCallback: function(){
            //your error callback code goes here
            console.log(data);
        }
     },
     sseUrl: "/sse-events",
     messageQueue: [],
     debug: false,
     callback: function(data){
        //your callback code goes here
        console.log(data);
     }
  }
```

- **ajax.url**: `String` end-point that will be hit using AJAX "GET" request "supports CORS" (nullable, if set to null AJAX call will not be run on SSE event and skip to **callback**)
- **ajax.apiKey**: `Object` key-value-pair header information passed part of the AJAX "GET" request (using **setRequestHeader**)
- **ajax.errorCallback**: `Function` callback function on AJAX failure (if the server response is not 200 the error callback will be triggered)
- **sseUrl**: `String` end-point that `EventSource` will bind it self to
- **messageQueue**: `Array` an interval will check the messageQueue array once a second and trigger the relevant callback flow
- **debug**: `Boolean` enables debug mode that prints all messages to the console (default set to false)
- **callback**: `Function` callback function that gets triggered based on the relevant callback flow (AJAX or SSE event)





