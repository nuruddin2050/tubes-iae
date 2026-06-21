FROM php:8.4-cli

# Install OS dependencies + PHP extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    zip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    && docker-php-ext-install pdo_mysql zip bcmath \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy source
COPY . .

# Install dependencies (bypass PHP version check)
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --ignore-platform-reqs

# Warm up config cache (never fail build)
RUN php artisan config:cache || true

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

