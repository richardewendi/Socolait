-- Supprime les anciennes tables si elles existent pour une réinitialisation propre.
-- L'ordre est important à cause des clés étrangères (on supprime `releves` avant `compteurs`).
DROP TABLE IF EXISTS releves;
DROP TABLE IF EXISTS compteurs;
DROP TABLE IF EXISTS utilisateurs;

-- On supprime les types. Il faut d'abord s'assurer qu'aucune table ne les utilise.
DROP TYPE IF EXISTS role_utilisateur;
DROP TYPE IF EXISTS statut_compteur;


-- Création de types ENUM pour des champs contrôlés, c'est une bonne pratique.
CREATE TYPE role_utilisateur AS ENUM ('agent', 'admin');
CREATE TYPE statut_compteur AS ENUM ('actif', 'inactif', 'maintenance');

-- Table pour gérer les utilisateurs de l'application (agents de relevé, administrateurs)
CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    -- Le mot de passe doit toujours être stocké sous forme de hash sécurisé
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    role role_utilisateur NOT NULL DEFAULT 'agent',
    date_creation TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table principale pour les compteurs d'eau (mise à jour pour inclure l'adresse)
CREATE TABLE compteurs (
    id SERIAL PRIMARY KEY,
    -- Le numéro unique visible sur le compteur
    numero_compteur VARCHAR(100) UNIQUE NOT NULL,
    -- Le code-barre, s'il existe, pour un scan rapide
    code_barre VARCHAR(100) UNIQUE,
    -- L'adresse est maintenant stockée directement dans cette table
    adresse_installation TEXT,
    -- Autres champs
    type_compteur VARCHAR(50),
    diametre_nominal VARCHAR(20),
    date_installation DATE,
    statut statut_compteur NOT NULL DEFAULT 'actif'
);

-- Table pour enregistrer chaque relevé d'index (mise à jour selon la demande)
CREATE TABLE releves (
    id SERIAL PRIMARY KEY,
    -- Renommé pour correspondre à la convention du front-end
    id_compteur INTEGER NOT NULL REFERENCES compteurs(id) ON DELETE CASCADE,
    -- Renommé pour correspondre à la convention du front-end
    operateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    date_releve TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Ajout de l'ancien index comme demandé
    ancien_index DECIMAL(10, 3) NOT NULL,
    -- Renommé pour correspondre à la convention du front-end
    nouvel_index DECIMAL(10, 3) NOT NULL,
    -- Colonne pour stocker la consommation calculée
    consommation DECIMAL(10, 3),
    notes TEXT,
    photo_releve_url VARCHAR(255),
    -- Contrainte pour assurer la cohérence des données
    CONSTRAINT nouvel_index_superieur_ancien_index CHECK (nouvel_index >= ancien_index)
);

-- Création d'index pour améliorer les performances des recherches fréquentes
CREATE INDEX idx_releves_compteur_date ON releves (id_compteur, date_releve DESC);
CREATE INDEX idx_compteurs_numero_compteur ON compteurs (numero_compteur);