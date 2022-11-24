use std::env;
use std::path::Path;
use actix_cors::Cors;
use actix_web::{App, HttpServer, web};
use actix_web::middleware::Logger;
use diesel::{PgConnection, r2d2};
use diesel::r2d2::ConnectionManager;
use env_logger::Env;
use log::{error, info};
use routes::nn;

mod routes;
mod models;
mod util;
mod services;


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(Env::default().default_filter_or("info"));
    let endpoint = format!("0.0.0.0:{}", 8080);

    let model_dir = env::var("MODEL_DIR").unwrap_or_else(|_| {
        // exit the process
        error!("MODEL_DIR environment variable not set");
        std::process::exit(1);
    });

    if !Path::new(&model_dir).exists() {
        error!("MODEL_DIR set but {} doesnt exist", &model_dir);
        std::process::exit(1);
    }

    env::var("DATA_DIR").unwrap_or_else(|_| {
        // exit the process
        error!("DATA_DIR environment variable not set");
        std::process::exit(1);
    });

    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
        // exit the process
        error!("DATABASE_URL environment variable not set");
        std::process::exit(1);
    });

    let manager = ConnectionManager::<PgConnection>::new(database_url);

    let pool = r2d2::Pool::builder()
        .max_size(5)
        .build(manager)
        .expect("Failed to create pool.");

    info!("Running server at {}", endpoint);
    info!("Model directory: {}", std::env::var("MODEL_DIR").unwrap());
    info!("Data directory: {}", std::env::var("DATA_DIR").unwrap());

    actix_rt::spawn(async move { services::history_service::run(pool).await });


    HttpServer::new(|| {
        App::new()
            .wrap(Cors::permissive())
            .wrap(Logger::default())
            .service(
                web::scope("/sports")
                            .route("/predict/all", web::get().to(nn::predict_all))
                            .route("/games", web::get().to(nn::games))
            )
    })
        .bind(endpoint)?
        .run()
        .await

}

