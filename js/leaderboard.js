$(document).ready(function () {

});

memberlist = [];
$.post("/auth/getroyale", function (data) {
    $.each(data, function (i, user) {
        let stats = JSON.parse(user.royaleScores);
        stats["name"] = user.name;
        stats["kd"] = stats.deaths == 0 ? stats.kills : (stats.kills / stats.deaths).toFixed(2);
        stats["acc"] = stats.shotsHit == 0 ? stats.shotsHit : (stats.shotsHit / stats.shotsFired * 100).toFixed(2) + "%";
        memberlist.push(stats);
    })
    $('#table').DataTable({
        data: memberlist,
        "order": [[ 2, "asc" ]],
        columns: [
            { data: 'name' },
            { data: 'gamesPlayed' },
            { data: 'gamesWon' },
            { data: 'kills' },
            { data: 'kd' },
            { data: 'shotsFired' },
            { data: 'shotsHit' },
            { data: 'acc'},
            { data: 'damageDone' },
            { data: 'damageTaken' },
            { data: 'healthRegenerated' },
            { data: 'emotesEmoted' },
            { data: 'itemsPickedup' },
            { data: 'lockersOpened' }
        ]
    });
});
