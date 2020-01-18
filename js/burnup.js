// javascript functions used by login.html

	function PageSetup()
	{
		var URLCode = location.search; //used for User-authorization

        if (URLCode == null) //used for User-authorization - redirect
        {
            toHome()
        }
        else
        {
            projectID = sessionStorage.getItem('projectID')
            loadChart(projectID);
            loadProject(projectID);
        }

	}

	function loadProject(projectID)
    	    {

                //load project details
                href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/projects/"+ projectID
                projectDetail = REST_WCP('GET',href, sessionStorage.getItem('accessToken')); // make the ajax WS call - see jsfuncs.js
                var jdata = jQuery.parseJSON(projectDetail.responseText);
                $("#projectName").text(jdata.name);
                $("#projectOwner").text("Owner: "+jdata.owner.descriptor);

                return false;
            }

	function loadChart(projectID)
	{

	    var dataPoint = {};
	    var t = new Date();
	    var start = t.getTime();
	    var dates = defineDates(start);
	    var  href = sessionStorage.getItem('WDTenant') + "/wql/v1/data?query=SELECT+projectPlanTask%2CendDate,createdOn2+FROM+projectPlanTasks+%28dataSourceFilter%3DprojectPlanTasksForProjectsProjectHierarchies%2CprojectsAndProjectHierarchies%3D%22"+projectID+"%22%29";
        var response = REST_WCP('GET',href, sessionStorage.getItem('accessToken')); // make the ajax WS call

	    $.each(dates, function (key, value)
	    {
	        var date = new Date(dates[key]);

            actual = countActuals(response.responseJSON.data,date);
            target = countTarget(response.responseJSON.data,date);

	        dataPoint[key] = {"date":date.toLocaleString().split(',')[0],"target":target,"actual":actual}

	    });
	    buildTable(dataPoint);
	    buildChart(dataPoint);
	}

	function countActuals(jdata,date)
	{
            var count = 0;
            $.each(jdata, function (key, value)
	                {
	                if (value.endDate  <= date.toISOString() && value.endDate != null )
	                {
	                    count++
	                }
	                });
            return count;
    }

    function countTarget(jdata,date)
    	{

           var count = 0;
                       $.each(jdata, function (key, value)
                            {
                            if (value.createdOn2 <= date.toISOString() && value.createdOn2 > '1970-01-01' )
                            {
                                count++
                            }
                            });
                       return count;
        }

    function defineDates(start)
        {
            // calculates the dates 6 week back

            var dates = {}
            dates [0] = start
            for (i = 1; i < 6; i++)
                    {
                    dates[i] = dates[i-1] - 604800000
                    }
            return dates;
        }


    function buildTable(chartData)
    {
        var tableData = '<table class="table table-striped table-sm"><thead><tr><th>Date</th><th>In Scope</th><th>Completed</th></tr></thead><tbody>'
        $.each(chartData, function(key,value)
        {
            tableData += "<tr><td>"+chartData[key].date+"</td><td>"+chartData[key].target+"</td><td>"+chartData[key].actual+"</td>"
            tableData += "</tr>"

        });

        tableData += '</tbody></table>'
        document.getElementById('burnupTable').innerHTML = tableData;
    }

    function buildChart(chartData)
    {
        var ctxL = document.getElementById("myChart").getContext('2d');
        var myLineChart = new Chart(ctxL, {
        type: 'line',
        data: {
        labels: [chartData[5].date, chartData[4].date,chartData[3].date, chartData[2].date, chartData[1].date, chartData[0].date],
        datasets: [{
        label: "In Scope",
        data: [chartData[5].target, chartData[4].target,chartData[3].target, chartData[2].target, chartData[1].target, chartData[0].target],
        backgroundColor: [
        'rgba(105, 0, 132, .2)',
        ],
        borderColor: [
        'rgba(200, 99, 132, .7)',
        ],
        borderWidth: 2
        },
        {
        label: "Completed",
        data: [chartData[5].actual, chartData[4].actual,chartData[3].actual, chartData[2].actual, chartData[1].actual, chartData[0].actual],
        backgroundColor: [
        'rgba(0, 137, 132, .2)',
        ],
        borderColor: [
        'rgba(0, 10, 130, .7)',
        ],
        borderWidth: 2
        }
        ]
        },
        options: {
        responsive: true
        }
        });
    }

    function toHome()
    {
        window.location.href = "index.html";
    }

