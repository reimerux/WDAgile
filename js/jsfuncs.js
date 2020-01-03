// common javascript functions

// global vars - all varnames start with global_ by convention
	var global_tenantURI;
	var global_token;
	var global_ClientId;
	var global_CurrentPage;
	var global_PageSize;
	var global_SecurityModel;

	// on change for from date or to date - resets current page to 0
  	function resetCurPage()
  	{
		global_CurrentPage = 0;
		saveGlobalVars();
  	}

  	// sets up global vars, then calls PageSetup
	// it is assumed that PageSetup() is defined 
	// within the context of the page that included this one
	function Initialize()
	{
		fetchGlobalVars();
		PageSetup();
	}
	
	function fetchGlobalVars()
	{
		// may be null
		global_tenantURI = sessionStorage.getItem('WDTenant');
		global_token = sessionStorage.getItem('accessToken');
		global_ClientId = sessionStorage.getItem('ClientID');

		// default curpage = 0, pagesize = 10, security model = 'oauth'
		// set defaults if currently null
		global_CurrentPage = sessionStorage.getItem('curpage');
		if(!global_CurrentPage)
		{
			global_CurrentPage = '0';
			sessionStorage.setItem('curpage',global_CurrentPage);
		}
		global_PageSize = sessionStorage.getItem('pagesize');
		if(!global_PageSize)
		{
			global_PageSize = '10';
			sessionStorage.setItem('pagesize',global_PageSize);
		}
		global_SecurityModel = 'oauth';
		sessionStorage.setItem('securityModel',global_SecurityModel);
		
		return 0;
	}
	
	function saveGlobalVars()
	{
		sessionStorage.setItem('WDTenant',global_tenantURI);
		sessionStorage.setItem('accessToken',global_token);
		sessionStorage.setItem('ClientID',global_ClientId);
		sessionStorage.setItem('curpage',global_CurrentPage);
		sessionStorage.setItem('pagesize',global_PageSize);
	}
	
	// call rawResponse or MakeTable depending upon selection for how to render response
	function renderResponse(resObject, req_url)
	{
		if($("#dispType option:selected").val() == 'JSON')
	  	{
		  	rawResponse(resObject, req_url);
	  	}
	  	else if ($("#dispType option:selected").val() == 'Table')
	  	{
	  	    makeTable(resObject, req_url);
	  	}
	  	else
	  	{
		  	saveToLocal(resObject, req_url)
	  	}

	}

	// generic GET REST WS Call for all APIs.  url and security token are passed as args
	function REST_GET(req_url, sec_token)
	{
	    $.ajax(
		{
	        'type': 'GET',
	        'url': req_url,
		   'dataType':'json',
	        headers: {
			'Authorization': 'Bearer ' + sec_token,
			'X-Tenant' : 'super',
			'Content-Type' : 'text/xml; charset=UTF-8' },
	        complete: function(xhr,data)
		  	{
	  			renderResponse(xhr, req_url);
	        }
		});
		return false;

	}

	function REST_PATCH(req_url, sec_token, payload)
    	{
    	    $.ajax(
    		{
    	        'type': 'PATCH',
    	        'url': req_url,
    		   'dataType':'json',
    		    data: JSON.stringify(payload),
    	        headers: {
    			'Authorization': 'Bearer ' + sec_token,
    			'X-Tenant' : 'super',
    			'Content-Type' : 'text/xml; charset=UTF-8' },
    	        complete: function(xhr,data)
    		  	{
    	  			saveToWD(xhr, req_url);
    	        }
    		});
    		return false;

    	}

    function REST_WCP(type, req_url, sec_token,payload)
        {
             var response;
             $.ajax(
                    {
                        'type': type,
                        'url': req_url,
                        'dataType':'json',
                        data: JSON.stringify(payload),
                        'async': false,
                        headers: {
                        'Authorization': 'Bearer ' + sec_token,
                        'X-Tenant' : 'super',
                        'Content-Type' : 'text/xml; charset=UTF-8' },
                        complete: function(xhr,data)
                        {
                         response = xhr;
                        }
                    }
                   );
            return response;
        }