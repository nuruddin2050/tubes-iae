# 1. Menggunakan image resmi PHP 8.2 + Apache
FROM php:8.3-apache

# 2. Install dependensi sistem dan ekstensi PHP yang dibutuhkan Laravel & Redis
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql gd

# 3. Aktifkan modul mod_rewrite bawaan Apache (wajib buat routing Laravel)
RUN a2enmod rewrite

# 4. Ubah Document Root Apache agar mengarah ke folder 'public' Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 5. Install Composer di dalam container
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 6. Set folder kerja di dalam container
WORKDIR /var/www/html

# 7. Copy seluruh source code Laravel di laptop ke dalam container
COPY . .

# 8. Jalankan composer install untuk mengunduh vendor folder di dalam container
RUN composer install --no-interaction --optimize-autoloader

# 9. Berikan hak akses (permission) folder storage dan bootstrap cache ke Apache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 10. Buka port 80 untuk akses web
EXPOSE 80

# 11. Jalankan Apache di foreground
CMD ["apache2-foreground"]