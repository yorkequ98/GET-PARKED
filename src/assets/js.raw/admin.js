if (top.location.pathname === '/admin.html') {
    $(document).ready(function() {
		$("span").css("visibility", "hidden");

		Chart.scaleService.updateScaleDefaults('linear', {
			ticks: {
				min: 0
			}
		});

		$.ajax({
            url: window.getUrl(`/api/statistics-total`),
            type: 'GET',
            xhrFields: {
                withCredentials: false
            },
            success: function (data) {
				
				$('#statsTotal').text(data[0].number)
				
            }
        }).fail(function (jqXHR, textStatus, error) {
            console.log(jqXHR, error)
		});


		$.ajax({
            url: window.getUrl(`/api/statistics-week`),
            type: 'GET',
            xhrFields: {
                withCredentials: false
            },
            success: function (data) {
				times = [];
				count = [];
                $.each(data, function(index) {
					times[index] = data[index].createdDate.substring(0, data[index].createdDate.indexOf('T'));
					count[index] = data[index].number;
                });
				
				var ctx = $('#weekChart');

				var weekChart = new Chart(ctx, {
					type: 'bar',
					data: {
					labels: times,
					datasets: [
						{ 
						data: count
						}
					]
					}
				});

				const goal = 15;	// Arbitrarily set the weekly goal to 15 clicks/week

				var weekTotal = count.reduce((a,b) => a + b, 0);
				var weekPercent = weekTotal/goal;

				var ctxPercent = $('#percentChart');

				var percentChart = new Chart(ctxPercent, {
					type: 'doughnut',
					data: {
					datasets: [
						{ 
						data: [weekPercent, 1 - weekPercent],
						backgroundColor: ['rgba(255,0,0,0.5)', 'rgba(0,0,0,0)']
						}
					]
					}
				});

				$('#statsPercentage').text(Math.round(weekPercent * 100) + "%")
            }
        }).fail(function (jqXHR, textStatus, error) {
            console.log(jqXHR, error)
		});
		

		$.ajax({
            url: window.getUrl(`/api/statistics-month`),
            type: 'GET',
            xhrFields: {
                withCredentials: false
            },
            success: function (data) {
				timesMonth = [];
				countMonth = [];
                $.each(data, function(index) {
					timesMonth[index] = data[index].createdDate;
					countMonth[index] = data[index].number;
                });
				
				var ctx = $('#monthChart');

				var monthChart = new Chart(ctx, {
					type: 'bar',
					data: {
					labels: timesMonth,
					datasets: [
						{ 
						data: countMonth
						}
					]
					}
				});
            }
        }).fail(function (jqXHR, textStatus, error) {
            console.log(jqXHR, error)
        });

    });
}