// javascript functions used by login.html

	function PageSetup()
	{
		//$('#tokendiv').hide();
		$('#wdurl').val(global_tenantURI);
		$('#clientID').val(global_ClientId);
		var hashval = location.hash;
		var userMsg = 'Not Currently Authenticated for Workday Access';
		var match = hashval.match(/[?&#]access_token=([^&]*)?/);

		if(match)
		{
			global_token = match[1];
			saveGlobalVars();
			location.href = location.origin + location.pathname;
		}
		if(global_token)
		{
			$('#token').val(global_token);
			$('#tokendiv').show();
			//$('#login').hide();
			userMsg = 'Authenticated for Workday Access. The Access Token above is saved in session storage.';
		}
		document.getElementById("pageData").innerHTML = userMsg;
		return 0;
	}

	function genToken()
	{
		if($("#wdurl").val() == '' || $("#clientID").val() == '')
		{
			document.getElementById("pageData").innerHTML = "Workday URI and API Client ID are required";
		}
		else
		{
			global_tenantURI = $("#wdurl").val();
			global_ClientId = $('#clientID').val();
			global_token='';
			$("#token").val(global_token);
			saveGlobalVars();

            var redir = window.location.origin;
            if (redir == "https://reimerux.github.io")
            {
                redir += "/WDAgile"
            }
            auth_url = global_tenantURI.replace('api','auth.api') + "/v1/authorize?response_type=token&client_id=" +
                global_ClientId + "&redirect_uri=" + redir + "/login.html";

			window.location.href = auth_url;
			return false;
		}
	}

	function clearInputs()
	{
		sessionStorage.clear();
		location.reload();
	}


    function toHome()
    {
        window.location.href = "index.html";
    }

