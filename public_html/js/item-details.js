$(()=>{
    let timer = new Timer();
    //timer.start();
    // console.log($("#item-detail").data("itemid"));
    $.get(`/items/${$("#item-detail").data("itemid")}/time`,function(data){
        // console.log(data);
        console.log(data.timeRemaining);

        timer.start({countdown: true, startValues: {seconds: data.timeRemaining}});
        $('#timer').html(timer.getTimeValues().toString());

        timer.addEventListener("secondsUpdated", function (e) {
            $('#timer').html(timer.getTimeValues().toString());
        });

        timer.addEventListener('targetAchieved', function (e) {
            $('#timer').append('KABOOM!!');
        });
    })
});
