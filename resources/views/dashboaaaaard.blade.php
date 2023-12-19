<!-- resources/views/dashboard.blade.php -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>

    <!-- Include Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    

</head>
<body>
    <div class="separator"></div>
    <nav class="navbar">
        <h1>@yield('navbar-title')</h1>
        <div class="toggle-container">
            <input type="checkbox" id="dark-mode-toggle">
            <label for="dark-mode-toggle">Dark Mode</label>
        </div>
    </nav>

    <div class="container mt-5">
        <div class="jumbotron">
            <h1 class="display-4">Selamat datang di Dashboard!</h1>
            <p class="lead">Ini adalah tempat untuk mengelola absensi.</p>
            <hr class="my-4">
            <a class="btn btn-primary btn-lg" href="{{ route('absensiCreate') }}" role="button">Buat Absensi</a>
        </div>

        <!-- Include the content of index.blade.php -->
        @include('absensi.index', ['absensis' => $absensis])
    </div>
    <div class="content">
        @yield('content')
    </div>
    <!-- Include Bootstrap JS and your custom scripts -->
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>

    <!-- Dark mode toggle script -->
    <script>
        // Check the saved theme preference
        const isDarkMode = localStorage.getItem('darkMode') === 'enabled';

        // Set the initial theme
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }

        // Toggle dark mode on button click
        document.getElementById('dark-mode-toggle').addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');

            // Save the theme preference to localStorage
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
        });
    </script>
</body>
</html>
