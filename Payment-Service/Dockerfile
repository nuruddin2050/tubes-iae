FROM php:8.4-fpm

# Menginstal dependensi sistem
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Membersihkan cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Menginstal ekstensi PHP yang dibutuhkan Laravel dan MySQL
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Mengambil Composer versi terbaru
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Menetapkan direktori kerja
WORKDIR /var/www

# Menyalin seluruh file project ke dalam container
COPY . .

# Menjalankan instalasi paket composer
RUN composer install