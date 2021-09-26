pipeline {
    agent any

    stages {
        stage('Git Clone') {
            steps {
                cleanWs()
                git branch: 'main',url: 'https://github.com/V-CAPTCHA/user-management-backend.git'
                sh 'cp /var/lib/jenkins/workspace/env/user-management-backend/.env ./.env'
            }
        }
        stage('SonarQube Analysis') {
            environment {
            scannerHome = tool 'SonarLocal'
        }
            steps{
               withSonarQubeEnv('SonarLocal') {
                   sh "${scannerHome}/bin/sonar-scanner"
}
        }
        }
                stage('Docker PreBuild Clear old image') {
            steps {
                
                sh 'docker stop user_management_backend || true && docker rm user_management_backend || true'
                sh 'docker image rm user_management_backend || true'
            }
        }
                stage('Docker Build') {
            steps {
                
                sh 'docker build . -t user_management_backend'
            }
        }
                stage('Docker Deploy') {
            steps {
                
                sh 'docker run -p 3000:3000/tcp --restart=always -d --name user_management_backend user_management_backend:latest'
            }
        }
    }
}
