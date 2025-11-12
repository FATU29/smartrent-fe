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
    // Cache directories
    NODE_MODULES_CACHE = "${WORKSPACE}/.node_modules_cache"
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 20, unit: 'MINUTES')
    timestamps()
    ansiColor('xterm')
    disableConcurrentBuilds(abortPrevious: true)
    skipStagesAfterUnstable()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Setup Node.js') {
      steps {
        script {
          // Detect Node.js tool once and cache for all stages
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
      }
    }

    stage('Install Dependencies') {
      steps {
        nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
          script {
            echo "Installing npm dependencies with optimized caching..."
            sh """
              # Create cache directories
              mkdir -p ${NPM_CONFIG_CACHE}
              mkdir -p ${NODE_MODULES_CACHE}
              
              # Use npm ci with cache optimization
              # --prefer-offline: Use cache if available, skip network check
              # --no-audit: Skip security audit (saves 10-30 seconds)
              # --legacy-peer-deps: Faster dependency resolution if needed
              npm ci --prefer-offline --no-audit --cache ${NPM_CONFIG_CACHE}
            """
          }
        }
      }
    }

    // Run validation stages in parallel to save time
    stage('Validation') {
      parallel {
        stage('Lint') {
          steps {
            nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
              script {
                echo "Running ESLint..."
                try {
                  sh """
                    npm run lint
                  """
                  echo "✅ Linting passed!"
                } catch (Exception e) {
                  echo "❌ Caught exception: ${e.getClass().getName()}"
                  echo "❌ Error message: ${e.getMessage()}"
                  env.FAILED_STAGE = 'Lint'
                  env.BUILD_STATUS = 'FAILED'
                  error("Linting failed: ${e.getMessage()}")
                }
              }
            }
          }
          post {
            failure {
              script {
                echo "❌ Linting failed. Please fix the issues."
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
                  sh """
                    npm run typecheck
                  """
                  echo "✅ Type checking passed!"
                } catch (Exception e) {
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
                  sh """
                    npm run i18n:check
                  """
                  echo "✅ i18n check passed!"
                } catch (Exception e) {
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
                  sh """
                    npm run format:check
                  """
                  echo "✅ Format check passed!"
                } catch (Exception e) {
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
      }
    }

    // Run Build and SonarCloud in parallel for faster pipeline
    stage('Build & Quality') {
      parallel {
        stage('Build') {
          options {
            timeout(time: 30, unit: 'MINUTES')
          }
          steps {
            nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
              script {
                echo "Building Next.js application..."
                try {
                  sh """
                    mkdir -p ${NEXT_BUILD_CACHE_DIR}
                    mkdir -p .next/cache
                    NODE_ENV=production npm run build:check
                  """
                  env.BUILD_STATUS = 'SUCCESS'
                  echo "✅ Build completed successfully!"
                } catch (Exception e) {
                  env.FAILED_STAGE = 'Build'
                  env.BUILD_STATUS = 'FAILED'
                  error("Build failed: ${e.getMessage()}")
                }
              }
            }
          }
          post {
            success {
              archiveArtifacts artifacts: '.next/**/*', allowEmptyArchive: false, fingerprint: true
            }
          }
        }

        stage('SonarCloud Analysis') {
          options {
            timeout(time: 10, unit: 'MINUTES')
            // Non-blocking: don't fail pipeline if SonarCloud fails
            skipDefaultCheckout(false)
          }
          steps {
            script {
              echo "Running SonarCloud analysis (fast mode)..."
              
              withCredentials([
                string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN'),
                string(credentialsId: 'SONAR_PROJECT_KEY', variable: 'SONAR_PROJECT_KEY'),
                string(credentialsId: 'SONAR_ORG', variable: 'SONAR_ORG')
              ]) {
                nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
                  try {
                    def sonarCmd = sh(
                      script: 'which sonar-scanner || echo "npx -y sonar-scanner@latest"',
                      returnStdout: true
                    ).trim()
                    
                    if (sonarCmd == 'npx -y sonar-scanner@latest') {
                      sonarCmd = 'npx -y sonar-scanner@latest'
                    }

                    // Optimized for speed: minimal analysis, more exclusions, higher CPD threshold
                    sh """
                      ${sonarCmd} \\
                        -Dsonar.projectKey=\${SONAR_PROJECT_KEY} \\
                        -Dsonar.organization=\${SONAR_ORG} \\
                        -Dsonar.sources=src \\
                        -Dsonar.sourceEncoding=UTF-8 \\
                        -Dsonar.host.url=https://sonarcloud.io \\
                        -Dsonar.login=\${SONAR_TOKEN} \\
                        -Dsonar.exclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,**/__tests__/**,**/__mocks__/**,**/constants/common/**,**/node_modules/**,**/.next/**,**/dist/**,**/build/**,**/*.d.ts,**/types/**,**/generated/**,**/coverage/**,**/.cache/**,**/public/**,**/messages/**,**/scripts/** \\
                        -Dsonar.cpd.exclusions=**/constants/common/** \\
                        -Dsonar.coverage.exclusions=src/**/* \\
                        -Dsonar.cpd.minimumTokens=200 \\
                        -Dsonar.typescript.tsconfigPath=tsconfig.json \\
                        -Dsonar.scanner.force-deprecated-java-version=true
                    """
                    echo "✅ SonarCloud analysis completed!"
                  } catch (Exception e) {
                    // Non-blocking: log error but don't fail pipeline
                    echo "⚠️ SonarCloud analysis failed (non-blocking): ${e.getMessage()}"
                    echo "ℹ️ Check SonarCloud dashboard for details"
                  }
                }
              }
            }
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

        // Clean up workspace (preserve caches for next build)
        echo "Cleaning up workspace (preserving caches)..."
        sh """
          # Preserve npm cache and Next.js cache for faster subsequent builds
          # Only clean build artifacts, not caches
          # rm -rf .next/standalone .next/static
          
          # Optional: Clean up node_modules to save space (uncomment if needed)
          # rm -rf node_modules
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

