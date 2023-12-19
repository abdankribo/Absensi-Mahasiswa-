<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Absensi</title>
    <!-- Include Bootstrap CSS or any other CSS framework you are using -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
</head>
<body>


    <div class="container mt-5">
        <h2>Create Absensi</h2>
        <form method="POST" action="{{ route('absensi.store') }}">
            @csrf

            <!-- Mahasiswa Dropdown -->
            <div class="form-group">
                <label for="mahasiswa_id">Mahasiswa:</label>
                <select name="mahasiswa_id" id="mahasiswa_id" class="form-control">
                    @foreach($mahasiswas as $mahasiswa)
                        <option value="{{ $mahasiswa->nim }}">{{ $mahasiswa->nama }}</option>
                    @endforeach
                </select>
            </div>

            <!-- Matakuliah Dropdown -->
            <div class="form-group">
                <label for="matakuliah_id">Matakuliah:</label>
                <select name="matakuliah_id" id="matakuliah_id" class="form-control">
                    @foreach($matakuliahs as $matakuliah)
                        <option value="{{ $matakuliah->id }}">{{ $matakuliah->nama_matakuliah }}</option>
                    @endforeach
                </select>
            </div>
            
            <!-- Jadwal Dropdown -->
            <div class="form-group">
                <label for="jadwal_id">Jadwal:</label>
                <select name="jadwal_id" id="jadwal_id" class="form-control">
                    @foreach($jadwals as $jadwal)
                        <option value="{{ $jadwal->id }}" data-matakuliah="{{ $jadwal->matakuliah_id }}">{{ $jadwal->hari }} - {{ $jadwal->jam_mulai }}</option>
                    @endforeach
                </select>
            </div>
            
            <!-- QR Code Container -->
            <div class="form-group">
                <label for="qrcode">QR Code:</label>
                <div id="qrcode"></div>
                <input type="hidden" name="qrcode_data" id="qrcode_data">
            </div>

            <!-- Hidden input fields to store selected data -->
            <input type="hidden" name="mahasiswa_id" id="mahasiswa_id_hidden">
            <input type="hidden" name="matakuliah_id" id="matakuliah_id_hidden">
            <input type="hidden" name="jadwal_id" id="jadwal_id_hidden">

            {{-- <!-- Submit Button -->
            <button type="submit" class="btn btn-primary">Submit</button> --}}
            <!-- Tombol 'Kembali' -->
            <a href="{{ route('dashboardView') }}" class="btn btn-secondary">Kembali</a>
        </form>
    </div>

    <!-- Include the simple-qrcode library -->
    <!-- Include the simple-qrcode library -->
<!-- Include the simple-qrcode library -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
<script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>

<script>
    $(document).ready(function () {
        // Initialize QR code generator
        var qrcode = new QRCode(document.getElementById("qrcode"), {
            width: 128,
            height: 128
        });

        // Initial load of jadwals
        var allJadwals = {!! json_encode($jadwals) !!};

        // Function to generate and display QR code
        function generateQRCode() {
            // Clear the previous QR code
            qrcode.clear();

            var baseUrl = "{{ url('/') }}"; // Set your base URL
            var absensiData = {
                mahasiswa_id: $('#mahasiswa_id').val(),
                matakuliah_id: $('#matakuliah_id').val(),
                jadwal_id: $('#jadwal_id').val(),
                tanggal_absensi: getCurrentDate(), // Set to the current date
                status: 1, // Set status to 1
            };

            // Convert data to a query string
            var queryString = $.param(absensiData);

            // Generate new QR code with the data
            qrcode.makeCode(baseUrl + '/generate-absensi?' + queryString);
        }

        // Function to update jadwals based on the selected matakuliah
        function updateJadwals() {
            var selectedMatakuliah = $('#matakuliah_id').val();

            // Filter jadwals based on the selected matakuliah
            var filteredJadwals = allJadwals.filter(function (jadwal) {
                return jadwal.matakuliah_id == selectedMatakuliah;
            });

            // Update the jadwal dropdown with filtered jadwals
            var jadwalDropdown = $('#jadwal_id');
            jadwalDropdown.empty();

            $.each(filteredJadwals, function (index, jadwal) {
                jadwalDropdown.append($('<option>', {
                    value: jadwal.id,
                    text: jadwal.hari + ' - ' + jadwal.jam_mulai
                }));
            });

            // Call the function to regenerate QR code
            generateQRCode();
        }

        // Helper function to get the current date in the format YYYY-MM-DD
        function getCurrentDate() {
            var now = new Date();
            var year = now.getFullYear();
            var month = ('0' + (now.getMonth() + 1)).slice(-2);
            var day = ('0' + now.getDate()).slice(-2);
            return year + '-' + month + '-' + day;
        }

        // Event listeners for form elements
        $('#matakuliah_id').on('change', updateJadwals);
        $('form :input').on('input', generateQRCode);

        // Initial call to update jadwals
        updateJadwals();
    });
</script>


</body>
</html>
    