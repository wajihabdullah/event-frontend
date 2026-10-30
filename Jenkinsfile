pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 20, unit: 'MINUTES')
    timestamps()
  }

  environment {
    IMAGE_NAME = 'event-frontend'
    NAMESPACE  = 'event-app'
    DEPLOYMENT = 'frontend'
    CONTAINER  = 'frontend'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build') {
      steps {
        script {
          env.TAG = "build-${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
          echo "Building ${env.IMAGE_NAME}:${env.TAG}"
          sh "docker build -t ${env.IMAGE_NAME}:${env.TAG} ."
        }
      }
    }

    stage('Load into minikube') {
      steps {
        script {
          sh "minikube image load ${env.IMAGE_NAME}:${env.TAG}"
          sh "minikube image ls --format short | grep -q '${env.IMAGE_NAME}:${env.TAG}'"
        }
      }
    }

    stage('Deploy') {
      steps {
        script {
          sh """
            kubectl -n ${env.NAMESPACE} set image deployment/${env.DEPLOYMENT} \
              ${env.CONTAINER}=${env.IMAGE_NAME}:${env.TAG}
            kubectl -n ${env.NAMESPACE} rollout status deployment/${env.DEPLOYMENT} --timeout=180s
          """
        }
      }
    }

    stage('Verify') {
      steps {
        script {
          // Hits the Next.js rewrite, so this proves frontend -> backend -> postgres.
          sh """
            kubectl -n ${env.NAMESPACE} exec deploy/${env.DEPLOYMENT} -- \
              wget -qO- http://localhost:3000/api/health
          """
        }
      }
    }
  }

  post {
    always {
      sh 'docker image prune -f --filter until=24h || true'
      // Keep the last 4 versions in the node so `kubectl rollout undo` still works.
      sh '''
        minikube image ls --format short \
          | grep "/event-frontend:" \
          | sort -V \
          | head -n -4 \
          | xargs -r -n1 minikube image rm || true
      '''
    }
  }
}
