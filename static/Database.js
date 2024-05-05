


document.addEventListener('DOMContentLoaded', function() {
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    // const socket = io();

    document.getElementById('saveDataButton').addEventListener('click', function() {
        socket.emit('request_save_data');
    });
    
    socket.on('data_saved', function(response) {
        console.log(response.message);
    });

    socket.on('connect', function() {
        socket.emit('load_positions');
    });

    socket.on('positions_data', function(data) {
        console.log("position erhalten: "+data);
        var tbody = document.getElementById('positions_body');
        tbody.innerHTML = '';
        data.positions.forEach(function(pos) {
            var row = `<tr>
                <td><input type="checkbox" name="selected" value="${pos.id}"></td>
                <td>${pos.solar_azimuth.toFixed(2)}</td>
                <td>${pos.solar_elevation.toFixed(2)}</td>
                <td>${pos.heliostat_azimuth.toFixed(2)}</td>
                <td>${pos.heliostat_elevation.toFixed(2)}</td>
                <td><button onclick="deletePosition(${pos.id})">Löschen</button></td>
            </tr>`;
            tbody.innerHTML += row;
        });
    });

    window.deletePosition = function(id) {
        socket.emit('delete_position', {id: id});
    };

    socket.on('position_deleted', function(data) {
        var row = document.querySelector('tr input[value="' + data.id + '"]').parentNode.parentNode;
        row.parentNode.removeChild(row);
    });
});
