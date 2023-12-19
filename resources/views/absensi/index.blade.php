<!-- resources/views/absensi/index.blade.php -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Absensi View</title>

    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }

        h1 {
            text-align: center;
            color: #007bff;
            margin-top: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th, td {
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
        }

        thead {
            background-color: #007bff;
            color: #ffffff;
        }

        tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }

        tbody tr:nth-child(odd) {
            background-color: #ffffff;
        }
    </style>
</head>
<body>

    <h1>Daftar Hadir</h1>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Mahasiswa NIM</th>
                <th>Mahasiswa Name</th>
                <th>Matakuliah Name</th>
                <th>Jadwal Hari</th>
                <th>Jadwal Jam Mulai</th>
                <th>Tanggal Absensi</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($absensis as $absensi)
                <tr>
                    <td>{{ $absensi->id }}</td>
                    <td>{{ optional($absensi->mahasiswa)->nim }}</td>
                    <td>{{ optional($absensi->mahasiswa)->nama }}</td>
                    <td>{{ optional($absensi->matakuliah)->nama_matakuliah }}</td>
                    <td>{{ optional($absensi->jadwal)->hari }}</td>
                    <td>{{ optional($absensi->jadwal)->jam_mulai }}</td>
                    <td>{{ $absensi->tanggal_absensi }}</td>
                    <td>{{ $absensi->status }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

</body>
</html>
