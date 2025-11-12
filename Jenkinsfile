pipeline {
  agent any

  environment {
    NODE_VERSION = '24'
    NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
    NEXT_TELEMETRY_DISABLED = '1'
    BUILD_STATUS = 'UNKNOWN'
    FAILED_STAGE = ''
    // Next.js build optimization
    NEXT_BUILD_CACHE_DIR = "${WORKSPACE}/.next-cache"
    // Disable lint/typecheck in build (already done in separate stages)
    SKIP_ENV_VALIDATION = 'true'
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
    timestamps()
    ansiColor('xterm')
    // Cancel previous builds when a new build starts (for same PR/branch)
    // This ensures only the latest commit runs CI
    disableConcurrentBuilds(abortPrevious: true)
  }

  stages {
    stage('Checkout') {
      steps {
        script {
          // Get branch/PR information
          def branchName = env.GIT_BRANCH ?: env.BRANCH_NAME ?: 'unknown'
          def isPR = branchName.contains('PR-') || branchName.contains('pull/')
          
          echo "============================================"
          echo "Build Information"
          echo "============================================"
          echo "Branch: ${branchName}"
          echo "Is PR: ${isPR}"
          echo "Build Number: ${env.BUILD_NUMBER}"
          echo "============================================"
          
          // Checkout first to get the actual commit
          echo "Checking out code from ${branchName}"
          checkout scm
          
          // Get the actual checked out commit
          def checkedOutCommit = sh(
            script: 'git rev-parse HEAD',
            returnStdout: true
          ).trim()
          
          echo "Checked out commit: ${checkedOutCommit}"
          
          // Note: disableConcurrentBuilds(abortPrevious: true) in options will automatically
          // cancel any previous builds for the same job when a new build starts.
          // This ensures only the latest commit runs CI for each PR/branch.
          if (isPR || (branchName != 'main' && branchName != 'master' && branchName != 'dev')) {
            echo "ℹ️ Previous builds for ${branchName} will be automatically canceled"
            echo "ℹ️ Only the latest commit will run CI"
          }
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        // Use nodejs build wrapper (as per Jenkins documentation)
        // The nodeJSInstallationName should match the NodeJS installation name configured in:
        // Jenkins → Manage Jenkins → Tools → NodeJS installations
        // Common names: "NodeJS", "node", "Node 6.x", "Node 24.x", etc.
        // Try to find the correct tool name
        script {
          def toolNames = ['NodeJS', 'node', "Node ${NODE_VERSION}.x", "NodeJS-${NODE_VERSION}", 'NodeJS-24', 'NodeJS-20', 'Node 24.x', 'Node 20.x']
          def foundTool = null
          
          for (def toolName : toolNames) {
            try {
              // Test if tool exists by trying to use it
              nodejs(nodeJSInstallationName: toolName) {
                sh 'node --version && npm --version'
              }
              foundTool = toolName
              echo "✅ Found Node.js installation: ${toolName}"
              break
            } catch (Exception e) {
              echo "⚠️ Tool '${toolName}' not found, trying next..."
            }
          }
          
          if (!foundTool) {
            error("❌ NodeJS tool not found! Please configure Node.js in Jenkins → Manage Jenkins → Tools → NodeJS installations")
          }
          
          // Store the tool name for later stages
          env.NODEJS_TOOL_NAME = foundTool
        }
        
        // Use the found tool for this stage
        nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
          script {
            echo "Installing npm dependencies..."
            sh """
              npm ci --prefer-offline --no-audit
            """
          }
        }
      }
    }

    stage('Lint') {
      steps {
        nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
          script {
            echo "Running ESLint..."
            try {
              // sh step sẽ throw exception nếu exit code != 0
              // Exit code 0 = success, != 0 = error
              sh """
                npm run lint
              """
              echo "✅ Linting passed!"
            } catch (Exception e) {
              // Jenkins tự động throw exception khi shell command trả về exit code != 0
              // Exception được catch ở đây
              echo "❌ Caught exception: ${e.getClass().getName()}"
              echo "❌ Error message: ${e.getMessage()}"
              env.FAILED_STAGE = 'Lint'
              env.BUILD_STATUS = 'FAILED'
              // Re-throw error để Jenkins biết stage failed
              error("Linting failed: ${e.getMessage()}")
            }
          }
        }
      }
      post {
        failure {
          script {
            echo "❌ Linting failed. Please fix the issues."
            // Archive lint results if available
            archiveArtifacts artifacts: '**/eslint-report.*', allowEmptyArchive: true
          }
        }
      }
    }

    stage('Type Check') {
      steps {
        nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
          script {
            echo "Running TypeScript type checking..."
            try {
              // sh step tự động throw exception nếu exit code != 0
              sh """
                npm run typecheck
              """
              echo "✅ Type checking passed!"
            } catch (Exception e) {
              // Exception được throw khi npm run typecheck trả về exit code != 0
              echo "❌ Caught exception: ${e.getClass().getName()}"
              echo "❌ Error message: ${e.getMessage()}"
              env.FAILED_STAGE = 'Type Check'
              env.BUILD_STATUS = 'FAILED'
              error("Type checking failed: ${e.getMessage()}")
            }
          }
        }
      }
      post {
        failure {
          script {
            echo "❌ Type checking failed. Please fix the type errors."
            // Archive type errors if available
            archiveArtifacts artifacts: '**/*.tsbuildinfo', allowEmptyArchive: true
          }
        }
      }
    }

    stage('i18n Check') {
      steps {
        nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
          script {
            echo "Checking i18n translation keys..."
            try {
              // sh step tự động throw exception nếu exit code != 0
              sh """
                npm run i18n:check
              """
              echo "✅ i18n check passed!"
            } catch (Exception e) {
              // Exception được throw khi npm run i18n:check trả về exit code != 0
              echo "❌ Caught exception: ${e.getClass().getName()}"
              echo "❌ Error message: ${e.getMessage()}"
              env.FAILED_STAGE = 'i18n Check'
              env.BUILD_STATUS = 'FAILED'
              error("i18n check failed: ${e.getMessage()}")
            }
          }
        }
      }
      post {
        failure {
          script {
            echo "❌ i18n check failed. Please fix the translation key issues."
          }
        }
      }
    }

    stage('Format Check') {
      steps {
        nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
          script {
            echo "Checking code formatting..."
            try {
              // sh step tự động throw exception nếu exit code != 0
              sh """
                npm run format:check
              """
              echo "✅ Format check passed!"
            } catch (Exception e) {
              // Exception được throw khi npm run format:check trả về exit code != 0
              echo "❌ Caught exception: ${e.getClass().getName()}"
              echo "❌ Error message: ${e.getMessage()}"
              env.FAILED_STAGE = 'Format Check'
              env.BUILD_STATUS = 'FAILED'
              error("Format check failed: ${e.getMessage()}")
            }
          }
        }
      }
      post {
        failure {
          script {
            echo "❌ Format check failed. Run 'npm run format' to fix formatting issues."
          }
        }
      }
    }

    stage('Build') {
      options {
        // Increase timeout for build stage (build can take longer)
        timeout(time: 45, unit: 'MINUTES')
      }
      steps {
        nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
          script {
            echo "Building Next.js application..."
            echo "Using build:check to skip lint/typecheck (already done in Validation stage)"
            try {
              // Create cache directory for Next.js build cache
              sh """
                mkdir -p ${NEXT_BUILD_CACHE_DIR}
              """
              
              // Use build:check to skip lint/typecheck (already validated in separate stages)
              // This significantly speeds up the build process
              sh """
                npm run build:check
              """
              env.BUILD_STATUS = 'SUCCESS'
              echo "✅ Build completed successfully!"
            } catch (Exception e) {
              echo "❌ Caught exception: ${e.getClass().getName()}"
              echo "❌ Error message: ${e.getMessage()}"
              env.FAILED_STAGE = 'Build'
              env.BUILD_STATUS = 'FAILED'
              error("Build failed: ${e.getMessage()}")
            }
          }
        }
      }
      post {
        success {
          script {
            echo "✅ Build completed successfully!"
            archiveArtifacts artifacts: '.next/**/*', allowEmptyArchive: false, fingerprint: true
          }
        }
        failure {
          script {
            echo "❌ Build failed. Please check the build logs."
            // Archive build logs for debugging
            archiveArtifacts artifacts: '**/build-output.log', allowEmptyArchive: true
          }
        }
      }
    }

    stage('SonarCloud Analysis') {
      // Chạy trên tất cả các branch
      steps {
        script {
          echo "Running SonarCloud analysis..."
          
          // Configure SonarCloud credentials in Jenkins:
          // Option 1: Using Jenkins Credentials (Recommended - more secure)
          //   1. Go to Jenkins → Manage Jenkins → Credentials
          //   2. Add credentials with IDs: SONAR_TOKEN, SONAR_PROJECT_KEY, SONAR_ORG
          //   3. Use withCredentials block below
          //
          // Option 2: Using Environment Variables
          //   1. Set environment variables in Jenkins job configuration
          //   2. Or set them in the environment block at the top of this file
          //   3. Comment out withCredentials block and use env.SONAR_TOKEN directly
          
          // Load SonarCloud credentials (using withCredentials for security)
          // If using environment variables instead, comment this block and use env.SONAR_TOKEN, etc.
          withCredentials([
            string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN'),
            string(credentialsId: 'SONAR_PROJECT_KEY', variable: 'SONAR_PROJECT_KEY'),
            string(credentialsId: 'SONAR_ORG', variable: 'SONAR_ORG')
          ]) {
            nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
              try {
                // Check if sonar-scanner is available, if not use npx
                def scannerCommand = sh(
                  script: 'which sonar-scanner || echo "not-found"',
                  returnStdout: true
                ).trim()

                def sonarCmd = scannerCommand != 'not-found' ? 'sonar-scanner' : 'npx sonar-scanner'

                // SonarCloud configuration (same as GitHub workflow)
                sh """
                  ${sonarCmd} \\
                    -Dsonar.projectKey=\${SONAR_PROJECT_KEY} \\
                    -Dsonar.organization=\${SONAR_ORG} \\
                    -Dsonar.sources=src \\
                    -Dsonar.exclusions=**/*.test.ts,**/*.test.tsx,**/__tests__/**,**/constants/common/districts.ts,**/constants/common/wards.ts \\
                    -Dsonar.cpd.exclusions=**/constants/common/districts.ts,**/constants/common/wards.ts,**/constants/common/provinces.ts \\
                    -Dsonar.sourceEncoding=UTF-8 \\
                    -Dsonar.coverage.exclusions=src/**/* \\
                    -Dsonar.host.url=https://sonarcloud.io \\
                    -Dsonar.login=\${SONAR_TOKEN}
                """
                echo "✅ SonarCloud analysis completed!"
              } catch (Exception e) {
                echo "❌ Caught exception: ${e.getClass().getName()}"
                echo "❌ Error message: ${e.getMessage()}"
                env.FAILED_STAGE = 'SonarCloud Analysis'
                env.BUILD_STATUS = 'FAILED'
                error("SonarCloud analysis failed: ${e.getMessage()}")
              }
            }
          }
        }
      }
      post {
        always {
          script {
            echo "SonarCloud analysis stage completed."
          }
        }
        failure {
          script {
            echo "❌ SonarCloud analysis failed. Check SonarCloud dashboard for details."
          }
        }
      }
    }
  }

  post {
    always {
      script {
        // Capture build information
        def buildInfo = """
          ============================================
          BUILD INFORMATION
          ============================================
          Job: ${env.JOB_NAME}
          Build Number: ${env.BUILD_NUMBER}
          Branch: ${env.GIT_BRANCH ?: env.BRANCH_NAME}
          Status: ${currentBuild.currentResult}
          Failed Stage: ${env.FAILED_STAGE ?: 'N/A'}
          Build URL: ${env.BUILD_URL}
          ============================================
        """
        echo buildInfo

        // Clean up workspace
        echo "Cleaning up workspace..."
        sh """
          # Clean up node_modules to save space (optional)
          # rm -rf node_modules
          
          # Clean up npm cache if needed
          # npm cache clean --force
        """
      }
      cleanWs(
        cleanWhenNotBuilt: false,
        deleteDirs: true,
        disableDeferredWipeout: true,
        notFailBuild: true
      )
    }
    success {
      script {
        echo "✅ Pipeline completed successfully!"
        env.BUILD_STATUS = 'SUCCESS'
      }
    }
    failure {
      script {
        echo "❌ Pipeline failed!"
        env.BUILD_STATUS = 'FAILED'
        
        // Get failure details
        def failedStage = env.FAILED_STAGE ?: 'Unknown'
        def buildUrl = env.BUILD_URL ?: 'N/A'
        def branch = env.GIT_BRANCH ?: env.BRANCH_NAME ?: 'N/A'
        
        echo """
          ============================================
          FAILURE DETAILS
          ============================================
          Failed Stage: ${failedStage}
          Branch: ${branch}
          Build URL: ${buildUrl}
          ============================================
        """
      }
    }
    unstable {
      script {
        echo "⚠️ Pipeline is unstable!"
        env.BUILD_STATUS = 'UNSTABLE'
      }
    }
    aborted {
      script {
        echo "⏹️ Pipeline was aborted!"
        env.BUILD_STATUS = 'ABORTED'
      }
    }
  }
}

